# Wave 3.3.5 - Implementation Blockers

## 1. Blocker Summary

Current blocker verdict:

```text
No critical blocker prevents starting observe-mode implementation.
Critical blockers prevent production constitutional enforcement.
```

Blocker counts:

| Severity | Count |
| --- | ---: |
| Critical | 6 |
| Major | 8 |
| Minor | 5 |

## 2. Critical Blockers

### C1 - Missing IntelligenceOrchestrator Source Implementation

Description:

`IntelligenceOrchestrator` is not found in `src/`.

Impact:

- No constitutional entrypoint exists for cross-authority workflows.
- UI/API/workers/jobs cannot be required to route through orchestrator.
- Policy, lifecycle, audit, and event routing remain documentation-only.

Risk:

High. Implementing enforcement or traffic redirection without the orchestrator would preserve shadow coordination.

Resolution strategy:

- Implement an observe-mode orchestrator layer first.
- Include request classification, route planning, lifecycle state, audit shape, and policy observe events.
- Do not redirect production traffic until facade parity exists.

### C2 - Missing Wave 3 Authority Facades

Description:

`StudentUnderstandingAuthority`, `OptionGeneratorAuthority`, and `OutcomeTrackerAuthority` are not found in `src/`.

Impact:

- 444 intelligence systems cannot be constitutionally wrapped.
- Existing engines remain directly callable.
- Ownership cannot be enforced at runtime.

Risk:

High. Without facades, there is no stable boundary for contracts, audit lineage, or runtime guards.

Resolution strategy:

- Create authority facades after ownership registry baseline.
- Wrap existing engines in place.
- Preserve direct legacy access until parity and traffic validation are complete.

### C3 - No Machine-Readable Ownership Registry

Description:

Ownership exists in markdown reports, but no source-level registry currently enforces the 444-file mapping.

Impact:

- New intelligence files can appear without owner classification.
- CI cannot block unowned intelligence.
- Runtime policy cannot resolve owner/capability/file metadata.

Risk:

High. Governance remains manual and drift-prone.

Resolution strategy:

- Convert the Wave 3.3 ownership map into a versioned registry.
- Include file owner, capability, classification, public surface status, allowed imports, and legacy-shadow status.
- Start in read-only/reporting mode.

### C4 - No Runtime Policy, Audit, or Authority Context Infrastructure

Description:

The enforcement architecture is documented, but source-level runtime policy engine, audit ledger, authority context, and capability token model are missing.

Impact:

- Authority calls cannot fail closed.
- Denials cannot be audited.
- Runtime shadow calls cannot be detected or blocked.

Risk:

High. Production enforcement without audit/policy is unsafe and non-replayable.

Resolution strategy:

- Define runtime context fields and audit records from Wave 3.3.2.
- Implement policy in observe mode first.
- Require audit records before block mode.

### C5 - Event and Idempotency Infrastructure Not Ready

Description:

Existing event and learning signal concepts exist, but no cross-authority orchestrator-owned event bus/outbox/inbox/dead-letter/idempotency system is present.

Impact:

- Learning signals can still flow as local dependencies.
- Outcome dual-run can duplicate records.
- Long-running workflows cannot safely retry or replay.

Risk:

High for LEARN migration and 10M+ student scale.

Resolution strategy:

- Introduce durable outbox/inbox and idempotency requirements before outcome traffic redirection.
- Keep outcome migration in shadow/observe mode until duplicate-write checks pass.

### C6 - Production Shadow Surface Still Exists

Description:

Wave 3.3.3 found 444 shadow intelligence systems, 393 non-owned imports into authority-owned files, and 131 non-owned files with transitive authority reach.

Impact:

- Product or feature code can reach engines without orchestrator.
- Public barrels can expose internal authority behavior.
- Shadow authority growth can continue until governed.

Risk:

High for enforcement correctness.

Resolution strategy:

- Do not block immediately.
- Add import graph reporting.
- Classify public surfaces.
- Deprecate direct access only after orchestrator/facade traffic migration.

## 3. Major Blockers

### M1 - Four Direct Cross-Authority Imports

Description:

Current direct imports:

- `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts -> src/intelligence/student-model/StudentModelEngine.ts`
- `src/intelligence/mentor/MentorEngine.ts -> src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/recommendation-engine/RecommendationEngine.ts -> src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/regret-engine/RegretEngine.ts -> src/intelligence/student-model/StudentBelief.ts`

Impact:

Option-generation systems directly depend on student-understanding internals.

Risk:

High for constitutional boundary integrity, medium for initial observe-mode implementation.

Resolution strategy:

Replace direct dependencies with orchestrator-routed immutable student snapshot contracts after facades exist.

### M2 - Contracts Are Documentation-Only

Description:

Wave 3.3.2 defines authority contracts, but key contract types were not found in `src`.

Impact:

Engineering teams cannot yet compile against canonical source contracts.

Risk:

Medium-high. Teams may create divergent local contract shapes.

Resolution strategy:

Extract source-level contracts before facade implementation. Keep them behavior-neutral.

### M3 - Public Surface Governance Missing

Description:

Public/index modules can expose authority-owned engines.

Impact:

Callers can bypass orchestrator through public barrels.

Risk:

Medium-high.

Resolution strategy:

Classify every public surface as orchestrator, authority facade, authority internal, shared-neutral, or test-only.

### M4 - Duplicate Intelligence Clusters Not Consolidated

Description:

Wave 3.3 found 12 overlapping clusters across recommendations, paths, market, decision/utility/regret, assessment, archetype, outcome, learning, and calibration.

Impact:

Outputs may remain inconsistent across engines until authority facades define canonical outputs.

Risk:

Medium.

Resolution strategy:

Wrap first. Merge only after parity, telemetry, and authority owner approval.

### M5 - Local Orchestration Hotspots

Description:

Wave 3.3 found 55 local orchestration hotspots.

Impact:

Some modules coordinate multiple internal behaviors outside the meta-orchestrator.

Risk:

Medium-high when hotspots cross authority concerns.

Resolution strategy:

Classify local orchestration as same-authority internal or cross-authority orchestration. Move only cross-authority lifecycle to orchestrator.

### M6 - Adjacent Decision/Confidence Boundary Integration Required

Description:

`DecisionAuthority` and `ConfidenceAuthority` exist, but Wave 3.3 forced many decision/confidence-adjacent files into the three Wave 3 buckets for reporting.

Impact:

Final decision behavior or global confidence behavior may be misrouted unless explicitly governed.

Risk:

Medium-high.

Resolution strategy:

Define DecisionAuthority and ConfidenceAuthority routing rules in orchestrator policy before option facade traffic migration.

### M7 - Parity Fixtures and Canary Controls Missing

Description:

No implementation evidence was found for golden-output parity fixtures, canary rollout flags, or migration feature flags.

Impact:

Facade wrapping and traffic redirection cannot be proven safe.

Risk:

Medium-high.

Resolution strategy:

Capture baseline fixtures and define workflow/authority feature flags before traffic redirection.

### M8 - Production Data Migration Controls Not Established

Description:

Prisma exists, but orchestrator lifecycle, audit, idempotency, and snapshot stores are not yet source-defined.

Impact:

Outcome and audit migration could duplicate, lose, or orphan data.

Risk:

High for LEARN traffic; medium for observe-mode work.

Resolution strategy:

Design and validate append-only stores and idempotency before outcome traffic is redirected.

## 4. Minor Blockers

### m1 - Governance Dashboards Missing

Impact:

Teams lack live ownership, dependency, orchestrator coverage, policy, and audit health views.

Resolution:

Add dashboard metrics after observe-mode registry and policy events exist.

### m2 - Test-Only Import Classification Missing

Impact:

Tests/examples may normalize production-forbidden import patterns.

Resolution:

Classify test-only imports and prevent production reachability.

### m3 - Contract Versioning Policy Not Enforced

Impact:

Contract drift remains possible.

Resolution:

Add contract version validation before CI blocking.

### m4 - Public Documentation and Source Naming Not Yet Aligned

Impact:

Future sessions may confuse docs-only authority names with source implementations.

Resolution:

Make source-level authority entrypoints explicit when implemented.

### m5 - Existing Dirty Worktree Context

Impact:

Many unrelated modified/untracked files exist in the repository, increasing review noise.

Resolution:

Keep constitutional implementation commits isolated and docs/source changes scoped.

## 5. Blocker Verdict

Readiness state:

```text
GO for observe-mode registry/validator work.
NO-GO for production enforcement or traffic redirection.
```

Critical blockers are implementation blockers for enforcement, not blockers for starting the safest first foundation step.
