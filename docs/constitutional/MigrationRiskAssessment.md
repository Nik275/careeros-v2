# Wave 3.3.4 - Migration Risk Assessment

## 1. Risk Summary

The constitutional migration is production-safe only if it wraps and routes existing intelligence before enforcing boundaries.

Highest risks:

1. Product regressions from facade output differences.
2. Data duplication or loss during outcome tracking migration.
3. Hidden callers bypassing orchestrator when blocking begins.
4. Latency or availability regressions from orchestration overhead.
5. Team confusion around authority ownership and adjacent Decision/Confidence boundaries.

## 2. Technical Risk

| Risk | Severity | Evidence | Mitigation |
| --- | --- | --- | --- |
| Missing orchestrator changes workflow shape | High | `IntelligenceOrchestrator` not found in `src/` | Start observe-only, no traffic dependency until route validation |
| Facade wrapping changes behavior | High | 444 engines currently operate locally | Golden-output parity tests and dual-run comparison |
| Direct imports remain after migration | High | 4 direct cross-authority imports and 393 non-owned imports into owned systems | Import graph validation, access-path deprecation, runtime context guards |
| Public barrels expose authority internals | High | `src/intelligence/index.ts` reaches multiple authorities | Classify public surfaces and replace production use with orchestrator/facade contracts |
| Duplicate clusters create inconsistent outputs | Medium | 12 overlapping clusters | Wrap first, merge only after telemetry and owner review |
| Adjacent authority ambiguity | Medium | Decision/confidence files assigned into Wave 3 buckets for reporting | Explicit DecisionAuthority and ConfidenceAuthority route rules |

## 3. Data Risk

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Outcome double-counting during dual-run | High | Idempotency keys, exposure IDs, dual-run shadow mode without write, duplicate detection |
| Lost learning signals during routing change | High | Durable outbox/inbox, retry, dead-letter queue, audit trail |
| Student snapshot mismatch | High | Immutable snapshot versions, payload hashes, direct-vs-facade parity checks |
| Recommendation exposure missing audit | Medium | Require audit record before exposure registration is complete |
| Contract version drift in historical data | Medium | Backward-compatible adapters and policy/version fields in records |

Zero-data-loss requirements:

- No destructive migration before snapshot references and audit lineage exist.
- No overwrite of existing outcome records.
- Append-only migration for outcome and audit history.
- Dual-run comparison must not write duplicate learning events.
- Rollback must preserve idempotency state.

## 4. Product Risk

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Recommendation rankings change unexpectedly | High | Output parity threshold, canary cohorts, side-by-side scoring |
| Assessment/profile outputs change | High | Snapshot comparison and assessment result parity tests |
| Future simulation response latency increases | Medium | Async flow support, queued responses, backpressure events |
| Mentor/guidance tone or content changes | Medium | Facade parity fixtures and user journey regression checks |
| User journey loses tracking continuity | High | Register exposures and outcomes through idempotent orchestrated flow |

Product safety controls:

- Canary by workflow and cohort.
- Feature flags by authority and capability.
- Direct legacy fallback while parity is incomplete.
- User journey regression suite for registration, onboarding, assessment, recommendation, roadmap, future simulation, feedback, and outcome tracking.

## 5. Scaling Risk

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Orchestrator becomes bottleneck | High | Stateless orchestrator instances, durable state stores, partitioning by `studentId` or `flowId` |
| Audit volume grows rapidly | High | Payload refs and hashes, append-only storage, retention policy, batch writes where safe |
| Event bus backpressure | Medium | Async queues, retries, dead-letter queues, per-authority rate limits |
| Long-running simulations block request path | Medium | Async processing and polling/webhook completion |
| Runtime policy engine outage | High | Cached policy versions, fail-closed for critical workflows, degraded mode for non-critical workflows |

10M+ student safeguards:

- Idempotency keys on commands and events.
- Durable outbox/inbox.
- Snapshot references instead of large payloads.
- Per-student ordering only where required.
- Horizontal orchestrator scaling.
- Authority health and circuit breaker events.

## 6. Team Risk

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Engineers add new intelligence outside owner | High | PR ownership checklist and CI new-intelligence detection |
| Teams disagree on owner | Medium | Authority owner review and constitutional classification rules |
| Governance blocks velocity | Medium | Observe/warn/block rollout and severity-based enforcement |
| Tests normalize forbidden direct imports | Medium | Test-only classification and production reachability scan |
| Migration ownership unclear | High | Authority owners, orchestrator owner, platform owner, compliance reviewer |

Team operating controls:

- Each PR declares UNDERSTAND, GENERATE, LEARN, ORCHESTRATE, DECIDE, or CONFIDENCE.
- Each new public surface requires architecture review.
- Cross-authority workflows require orchestrator owner approval.
- Duplicate cluster expansion requires authority owner review.

## 7. Rollback Risk

Rollback is safe only if each wave preserves previous behavior.

Required rollback controls:

| Control | Purpose |
| --- | --- |
| Feature flags by workflow | Disable orchestrated route without redeploying all callers |
| Per-authority flags | Roll back one authority without rolling back all intelligence |
| Idempotency state | Prevent duplicated outcomes or learning signals after rollback |
| Contract version compatibility | Re-enable previous contract version |
| Policy mode rollback | Move from block to warn for a specific capability |
| Audit continuity | Preserve trace across forward and rollback paths |

## 8. Risk Mitigation Sequence

1. Establish baseline inventory and output fixtures.
2. Create orchestrator in observe mode.
3. Wrap engines with facades without redirecting production traffic.
4. Run direct-vs-facade parity tests.
5. Canary low-risk workflows.
6. Add idempotent outcome and audit paths.
7. Expand traffic gradually.
8. Deprecate public/direct access paths only after no production callers remain.
9. Enable CI blocking for new violations first.
10. Enable runtime blocking after shadow-call telemetry is stable.

## 9. Residual Risk

Residual risk remains in:

- Duplicate clusters whose behavior is similar but not identical.
- Decision/confidence adjacent authority boundaries where current Wave 3.3 classification forced files into four buckets.
- Public barrels and examples/tests that can teach future direct import patterns.
- Long-running future simulation and outcome learning workflows that need async handling.

These risks are acceptable only with observe/warn/block rollout, audit lineage, and rollback flags.

## 10. Risk Assessment Verdict

The migration is high-impact but manageable because it can be performed as a wrapper-and-routing migration rather than a rewrite.

Risk posture:

```text
Unsafe: move/merge/delete first
Safe: wrap -> observe -> redirect -> validate -> deprecate -> enforce
```

With staged rollout, idempotency, parity checks, audit records, and feature flags, the migration can meet zero data loss, enterprise readiness, and constitutional compliance requirements.
