# Wave 3.3.4 - Implementation Roadmap

## 1. Roadmap Purpose

This roadmap gives engineering teams an executable order of implementation. It is planning only and does not implement code.

The order is designed to avoid a big-bang rewrite and preserve production behavior.

## 2. Priority 1 - Baseline and Freeze

Goal: establish the migration baseline before any implementation.

Tasks:

1. Freeze the Wave 3.3 ownership map as the starting registry input.
2. Capture current direct engine output fixtures for major workflows.
3. Capture current user journey fixtures:
   - Registration/onboarding.
   - Assessment.
   - Profile creation.
   - Career discovery.
   - Recommendation.
   - Roadmap/pathway.
   - Future simulation.
   - Feedback/outcome tracking.
4. Record the 4 direct cross-authority imports.
5. Record current public surfaces and direct import paths.
6. Define release rollback flags.

Exit criteria:

- Baseline inventory is versioned.
- Output fixtures exist for parity validation.
- Rollback flags are defined.

## 3. Priority 2 - Orchestrator Contract and Observe Mode

Goal: introduce the meta-authority without changing production behavior.

Tasks:

1. Define `RequestEnvelope`, response envelope, `AuthorityRouting`, lifecycle states, and audit record shape from Wave 3.3.2.
2. Define route classifications:
   - UNDERSTAND.
   - GENERATE.
   - LEARN.
   - DECIDE.
   - CONFIDENCE.
   - Multi-authority flow.
3. Define policy engine in observe mode.
4. Define orchestrator events:
   - `flow.received`
   - `flow.classified`
   - `policy.allowed`
   - `policy.denied`
   - `authority.call.started`
   - `authority.call.completed`
   - `authority.call.failed`
5. Add audit completeness requirements.
6. Validate that orchestrator does not import internal intelligence engines.

Exit criteria:

- Orchestrator can classify workflows in observe mode.
- Policy decisions are logged, not enforced.
- Existing callers are untouched.

## 4. Priority 3 - Authority Registry and Ownership Metadata

Goal: make ownership machine-readable before facade routing.

Tasks:

1. Convert the 444-file Wave 3.3 map into registry records.
2. Assign each file:
   - Authority owner.
   - Internal/public/shared/test classification.
   - Capability.
   - Allowed imports.
   - Allowed importers.
   - Legacy-shadow status.
3. Add event type owner mapping.
4. Add output type owner mapping.
5. Add public surface classifications.
6. Add adjacent authority references for `DecisionAuthority` and `ConfidenceAuthority`.

Exit criteria:

- All 444 intelligence files have exactly one owner.
- Registry can report shadow count by authority.
- Registry can identify forbidden edges.

## 5. Priority 4 - StudentUnderstandingAuthority Facade

Goal: wrap UNDERSTAND systems first because option generation depends on student understanding snapshots.

Tasks:

1. Define student authority command/query/event surface.
2. Wrap assessment processing.
3. Wrap profile generation.
4. Wrap archetype inference.
5. Wrap student belief/model construction.
6. Wrap student understanding confidence outputs with ConfidenceAuthority boundary awareness.
7. Produce immutable student understanding snapshot output.
8. Run direct-vs-facade parity fixtures.

Exit criteria:

- Student facade can produce current student understanding outputs.
- Output includes owner/version/lineage/audit references.
- No recommendation/pathway/future generation is created inside student facade.

## 6. Priority 5 - OptionGeneratorAuthority Facade

Goal: wrap GENERATE systems while consuming student understanding snapshots through the orchestrator contract.

Tasks:

1. Define recommendation, pathway, and future simulation command/query/event surface.
2. Wrap recommendation generation and ranking.
3. Wrap career fit and matching.
4. Wrap career taxonomy, career intelligence, and career graph systems.
5. Wrap pathway/roadmap systems.
6. Wrap future simulation systems.
7. Wrap market intelligence and option adjustment systems.
8. Wrap optionality/regret/utility/mentor guidance systems.
9. Validate DecisionAuthority and ConfidenceAuthority routing for adjacent concerns.
10. Run direct-vs-facade parity fixtures.

Exit criteria:

- Option facade can reproduce current recommendation/pathway/future outputs.
- Direct student-model dependency replacement plan is validated.
- Output includes owner/version/lineage/audit references.

## 7. Priority 6 - OutcomeTrackerAuthority Facade

Goal: wrap LEARN systems and prevent data loss before redirecting traffic.

Tasks:

1. Define outcome submission, observation, learning signal, quality, and feedback contracts.
2. Wrap recommendation exposure tracking.
3. Wrap decision/action/outcome tracking.
4. Wrap feedback ingestion.
5. Wrap learning loops and active learning.
6. Wrap calibration and quality metrics.
7. Add idempotency requirements for outcome writes.
8. Add durable learning signal routing contract.
9. Run audit and duplicate-write validation.

Exit criteria:

- Outcome facade can track current outcome flows.
- No duplicate outcome records in dual-run tests.
- Learning signals are represented as orchestrator-routed signals.

## 8. Priority 7 - Direct Violation Dependency Replacement

Goal: remove the four direct cross-authority dependency paths safely.

Tasks:

1. Replace `DecisionCoalitionEngine` direct student-model dependency with immutable student snapshot input.
2. Replace `MentorEngine` direct `StudentBelief` dependency with student snapshot/query contract.
3. Replace `RecommendationEngine` direct `StudentBelief` dependency with student snapshot contract.
4. Replace `RegretEngine` direct `StudentBelief` dependency with student snapshot contract.
5. Validate output parity.
6. Confirm import graph no longer reports production `OptionGeneratorAuthority -> StudentUnderstandingAuthority` imports.

Exit criteria:

- 4 direct cross-authority imports are resolved or isolated behind approved transitional adapters.
- Option generation consumes orchestrator-routed student understanding.

## 9. Priority 8 - Traffic Redirection

Goal: move callers to orchestrator gradually.

Tasks:

1. Identify current callers by workflow.
2. Redirect low-risk UNDERSTAND-only flows.
3. Redirect recommendation flows.
4. Redirect pathway and roadmap flows.
5. Redirect future simulation flows.
6. Redirect feedback and outcome tracking flows.
7. Redirect workers/jobs/schedulers.
8. Canary by cohort and workflow.
9. Monitor parity, latency, error rate, audit completeness, and shadow-call count.

Exit criteria:

- Major workflows enter orchestrator.
- Direct legacy caller percentage trends down.
- Rollback remains available per workflow.

## 10. Priority 9 - Public Surface Deprecation

Goal: stop production callers from using direct public barrels and engine exports.

Tasks:

1. Classify public surfaces as orchestrator, authority facade, internal, shared-neutral, or test-only.
2. Deprecate production direct use of multi-authority public barrels.
3. Deprecate production direct use of single-domain barrels after facade parity.
4. Preserve test-only imports for parity fixtures with production reachability guards.
5. Monitor remaining direct import use.

Exit criteria:

- No production caller uses multi-authority public barrel for intelligence workflow.
- Authority internals are not reachable from product entrypoints except through facade/orchestrator.

## 11. Priority 10 - Governance in Observe/Warn Mode

Goal: introduce governance before blocking production.

Tasks:

1. Add source inventory validation.
2. Add import graph validation.
3. Add public surface validation.
4. Add contract/event validation.
5. Add duplicate cluster drift reporting.
6. Add runtime shadow-call detection.
7. Add compliance dashboards.
8. Run observe mode for current violations.
9. Move new-violation checks to warn mode.

Exit criteria:

- Governance reports violations accurately.
- False positives are triaged.
- New intelligence additions require owner classification.

## 12. Priority 11 - Runtime Enforcement

Goal: enforce authority boundaries at execution time.

Tasks:

1. Require orchestrator-issued context for authority facade commands.
2. Add capability scoping by authority and operation.
3. Deny direct authority-to-authority command attempts.
4. Deny event-command bypass attempts.
5. Require audit record creation for allowed and denied calls.
6. Add dead-letter handling for blocked learning signals.
7. Canary block mode by workflow and authority.

Exit criteria:

- Authority command without orchestrator context fails in block mode.
- Denials are audited.
- Production block rollout has rollback flags.

## 13. Priority 12 - CI/CD Blocking and Release Gates

Goal: make constitutional governance enterprise-grade.

Tasks:

1. Block new unowned intelligence files.
2. Block direct cross-authority production imports.
3. Block public surfaces exposing multiple authority internals.
4. Block event-command authority bypass.
5. Block missing owner/version/lineage/audit fields for critical outputs.
6. Require release compliance report.
7. Require no hard-fail conditions for release.

Exit criteria:

- Constitutional compliance is enforced before merge and before release.
- Compliance score meets production threshold.
- Hard fail conditions block release.

## 14. Priority 13 - Post-Migration Consolidation

Goal: reduce complexity only after safe migration.

Tasks:

1. Review duplicate clusters.
2. Identify merge candidates with matching behavior and outputs.
3. Review physical move candidates where relocation reduces risk.
4. Deprecate unused legacy adapters.
5. Retain audit replay compatibility for old paths.

Exit criteria:

- Merge/move/deprecate actions are based on telemetry and owner approval.
- No product behavior changes without parity validation.

## 15. Roadmap Verdict

Execution order:

```text
baseline
  -> orchestrator observe
  -> ownership registry
  -> student facade
  -> option facade
  -> outcome facade
  -> direct violation replacement
  -> traffic redirection
  -> public surface deprecation
  -> governance observe/warn
  -> runtime enforcement
  -> CI/CD blocking
  -> post-migration consolidation
```

This order is executable by engineering teams and preserves the production-safe rule: do not move, merge, delete, or block until wrap, parity, routing, telemetry, and rollback exist.
