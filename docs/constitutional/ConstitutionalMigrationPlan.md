# Wave 3.3.4 - Constitutional Migration Plan

## 1. Migration Objective

Move CareerOS V2 from the current source-module intelligence architecture to the constitutional architecture without a big-bang rewrite.

The migration must:

- Preserve existing intelligence modules.
- Avoid data loss.
- Avoid deleting or moving files in early waves.
- Introduce orchestrator and authority facades incrementally.
- Redirect traffic gradually.
- Validate parity before enforcement.
- Eliminate shadow authority access paths only after safe coverage.

## 2. Migration Principles

| Principle | Meaning |
| --- | --- |
| Wrap before move | Existing engines remain in place until facade parity and traffic validation are complete. |
| Observe before block | Governance starts in observe/warn mode before production blocking. |
| Contract before traffic | Public contracts and request envelopes exist before callers redirect. |
| Routing before enforcement | `IntelligenceOrchestrator` becomes the entrypoint before old paths are blocked. |
| Data references before data migration | Durable snapshot refs and audit refs are introduced before any state migration. |
| Authority ownership before physical relocation | Logical ownership is established first; file moves are a later optional cleanup. |
| Rollback at every wave | Each wave has a clear path back to the previous behavior. |

## 3. Migration Waves Summary

| Wave | Name | Primary outcome |
| --- | --- | --- |
| Wave 1 | Create Orchestrator layer | A non-invasive orchestrator layer can classify and route requests in observe mode |
| Wave 2 | Create Authority facades | Existing engines are accessible behind stable domain authority facades |
| Wave 3 | Redirect traffic | Product, API, worker, and job traffic gradually moves to orchestrator entrypoints |
| Wave 4 | Move ownership | Logical ownership registry, contracts, events, and audit ownership become authoritative |
| Wave 5 | Remove shadow authority | Direct shadow access paths are deprecated, quarantined, then blocked |
| Wave 6 | Enforce governance | CI/CD, runtime policy, dashboards, and release gates become blocking |

## 4. Wave 1 - Create Orchestrator Layer

### Goals

- Establish `IntelligenceOrchestrator` as the meta-authority entrypoint.
- Define request/response envelopes from Wave 3.3.2.
- Add route classification for UNDERSTAND, GENERATE, LEARN, DECIDE, CONFIDENCE, and multi-authority workflows.
- Add lifecycle and audit concepts in observe mode.
- Do not change existing caller behavior yet.
- Do not call internal engines directly from orchestrator except through transitional adapters documented as legacy paths.

### Scope

- Orchestrator contract.
- Authority routing model.
- Lifecycle state model.
- Audit record shape.
- Policy engine in observe mode.
- Registry placeholder for current authority map.
- Observability events for route classification.

### Risks

| Risk | Impact |
| --- | --- |
| Orchestrator accidentally creates domain intelligence | Violates constitution |
| Request envelope too narrow | Future workflows need breaking contract changes |
| Audit model missing required identifiers | Replay and enterprise audit fail |
| Early callers depend on provisional routes | Migration coupling increases |

### Rollback Strategy

- Keep all existing direct engine callers unchanged.
- Run orchestrator in observe-only mode.
- Disable orchestrator entrypoints without changing existing behavior.
- Preserve route classification logs for later analysis.

### Validation Strategy

- Route classification tests for major workflows.
- Policy observe logs for allowed/forbidden edges.
- Audit record completeness checks.
- No production caller dependency on orchestrator required for release.

### Success Criteria

- Orchestrator can classify core workflows.
- Orchestrator emits lifecycle and policy observe events.
- Orchestrator does not create student understanding, options, outcomes, decisions, or confidence outputs.
- No current production path is broken.

## 5. Wave 2 - Create Authority Facades

### Goals

- Create stable facade contracts for:
  - `StudentUnderstandingAuthority`
  - `OptionGeneratorAuthority`
  - `OutcomeTrackerAuthority`
- Wrap existing engines behind their owning facade.
- Preserve internal engine implementations.
- Introduce owner/version/lineage/audit metadata in facade outputs.
- Keep direct legacy access available temporarily.

### Scope

- Student facade wraps the 50 student-understanding files.
- Option facade wraps the 339 option-generation files.
- Outcome facade wraps the 55 outcome-learning files.
- Facades expose commands, queries, events, health, metrics, and version metadata.
- Adjacent `DecisionAuthority` and `ConfidenceAuthority` remain recognized.

### Risks

| Risk | Impact |
| --- | --- |
| Facade output differs from direct engine output | Product regressions |
| Wrappers hide errors or change timing | Reliability regressions |
| Direct imports remain easier than facade use | Shadow systems persist |
| Authority boundaries conflict with existing shared types | Contract churn |

### Rollback Strategy

- Keep old direct engine paths available.
- Compare facade output to direct output.
- Use feature flags per workflow and per authority.
- Roll back caller route to direct engine path if facade parity fails.

### Validation Strategy

- Golden-output parity checks between direct engine and facade path.
- Contract compatibility tests.
- Authority owner/version fields present in outputs.
- Health checks for each facade.
- No cross-authority facade calls.

### Success Criteria

- Every discovered intelligence file has a facade ownership destination.
- Facades can execute representative workflows.
- Facade outputs preserve current behavior.
- Legacy direct paths still work during transition.

## 6. Wave 3 - Redirect Traffic

### Goals

- Redirect callers from direct engines/public barrels to `IntelligenceOrchestrator`.
- Start with low-risk workflows and canary cohorts.
- Use orchestrator-routed authority facade calls.
- Preserve existing behavior through parity comparisons.
- Register recommendation exposure and outcome tracking through orchestrated flows.

### Scope

- UI/API routes.
- Workers/jobs/schedulers.
- Public barrels and feature modules.
- Assessment, recommendation, pathway, future simulation, feedback, and outcome flows.

### Risks

| Risk | Impact |
| --- | --- |
| Caller misses required envelope metadata | Requests fail or become unauditable |
| Latency increases from orchestration | Product performance degradation |
| Multi-authority flow produces changed output order | User-facing regression |
| Outcome tracking double-counts during dual-run | Data quality risk |

### Rollback Strategy

- Use per-route and per-cohort feature flags.
- Keep direct legacy path as fallback until parity passes.
- Use idempotency keys to prevent duplicate outcome records.
- Disable dual-write or dual-run on data anomaly.

### Validation Strategy

- Canary rollout.
- Direct-vs-orchestrated output diffing.
- Latency and error budget monitoring.
- Audit completeness validation.
- Outcome duplicate detection.
- User journey regression tests.

### Success Criteria

- High-priority workflows enter orchestrator.
- Output parity meets threshold.
- No duplicate outcome records.
- No missing audit records on orchestrated requests.
- Direct path usage trend decreases.

## 7. Wave 4 - Move Ownership

### Goals

- Make logical authority ownership authoritative.
- Registry ownership becomes the source of truth.
- Contracts, events, outputs, and audit records carry owner/version/lineage.
- Direct cross-authority imports are replaced by snapshot and event contracts.
- Public surfaces are reclassified.

### Scope

- Ownership registry.
- Capability registry.
- Event owner registry.
- Output owner registry.
- Public surface classification.
- Cross-authority dependency cleanup.
- Test-only exceptions.

### Risks

| Risk | Impact |
| --- | --- |
| Registry mismatch with behavior | Wrong authority owns output |
| Public surface deprecation breaks callers | Integration regressions |
| Contract versions drift | Compatibility failures |
| Decision/confidence adjacent authority boundaries are misrouted | Constitutional violation |

### Rollback Strategy

- Registry version rollback.
- Keep prior contract versions active.
- Maintain legacy public surfaces in warn mode.
- Allow temporary policy exceptions with expiration and audit.

### Validation Strategy

- Import graph validation.
- Registry coverage validation.
- Public surface reachability validation.
- Event taxonomy validation.
- Contract version compatibility validation.

### Success Criteria

- 444 intelligence files have exactly one registered owner.
- Direct cross-authority imports are removed or isolated behind approved contract adapters.
- Public surfaces have single-authority, shared-neutral, orchestrator, or test-only classification.
- Authority outputs include owner/version/lineage/audit fields.

## 8. Wave 5 - Remove Shadow Authority

### Goals

- Deprecate direct shadow access paths.
- Quarantine or block production direct calls to authority internals.
- Remove or disable multi-authority public barrels for production intelligence use.
- Convert learning signals to orchestrator-routed delivery.
- Stop new shadow systems from entering the repo.

### Scope

- Direct engine imports from product callers.
- Direct authority-to-authority imports.
- Public multi-authority barrels.
- Shared utility intelligence behavior.
- Runtime calls without orchestrator-issued context.

### Risks

| Risk | Impact |
| --- | --- |
| Hidden caller still uses legacy path | Runtime failure after blocking |
| Test/example patterns mask production bypass | Future regressions |
| Shared utility behavior is reclassified late | Ownership ambiguity |
| Blocking mode too early | Production outage |

### Rollback Strategy

- Enforcement mode downgrade from block to warn for affected capability.
- Temporary policy exception with audit and expiration.
- Route caller back through legacy facade adapter.
- Restore public surface only as deprecated read-only compatibility if required.

### Validation Strategy

- Runtime shadow-call monitoring.
- Import graph zero-direct-violation check.
- Production reachability scan.
- Canary blocking by authority/capability.
- Audit denial monitoring.

### Success Criteria

- No production direct cross-authority imports.
- No production UI/API/job multi-authority direct calls.
- Shadow-call count trends to zero.
- Learning signals route through orchestrator.
- Deprecated public surfaces have no production callers.

## 9. Wave 6 - Enforce Governance

### Goals

- Turn constitutional governance from advisory to blocking.
- CI/CD blocks new unowned intelligence and forbidden dependencies.
- Runtime policy blocks invalid authority calls.
- Compliance dashboards track ownership, dependency, orchestrator coverage, runtime policy, and audit health.
- Release gates require constitutional compliance.

### Scope

- CI/CD ownership validation.
- Import graph validation.
- Contract and event validation.
- Runtime facade guards.
- Capability tokens.
- Audit ledger completeness.
- Governance dashboards.
- PR and architecture review gates.

### Risks

| Risk | Impact |
| --- | --- |
| False positives block engineering | Team velocity risk |
| Policy engine outage blocks workflows | Availability risk |
| Audit store pressure at scale | Performance risk |
| Dashboard blind spots | Governance risk |

### Rollback Strategy

- Per-policy enforcement mode rollback.
- Emergency allowlist with expiration and audit.
- Degraded async mode for non-critical workflows.
- Separate CI warn mode for low-severity non-production findings.

### Validation Strategy

- Hard-fail condition tests.
- Policy denial tests.
- Audit completeness tests.
- Dashboard metric validation.
- Release dry runs.
- Incident simulation for forbidden edge attempts.

### Success Criteria

- New unowned intelligence cannot merge.
- Direct cross-authority imports cannot merge.
- Runtime authority calls require orchestrator context.
- Events cannot command another authority directly.
- Audit completeness meets enterprise threshold.
- Release compliance score reaches production threshold with no hard-fail conditions.

## 10. Migration Completion Definition

Migration is complete when:

1. All 444 discovered intelligence files are registered to exactly one owner.
2. Existing engines are reachable through authority facades.
3. Cross-authority workflows enter through `IntelligenceOrchestrator`.
4. Direct cross-authority source imports are eliminated or non-production-only.
5. Public surfaces no longer expose multiple authority internals.
6. Outcome learning signals route through orchestrator.
7. Authority outputs include owner, version, lineage, and audit references.
8. CI/CD and runtime governance run in blocking mode for production paths.
9. Dashboards show zero production shadow calls.
10. Rollback paths exist for each capability and authority.

## 11. Migration Plan Verdict

The production-safe migration path is not:

```text
move all files -> rewrite all callers -> hope parity holds
```

The production-safe path is:

```text
orchestrator observe
  -> authority facade wrapping
  -> gradual traffic redirection
  -> logical ownership enforcement
  -> shadow access removal
  -> blocking governance
```

This plan supports zero data loss, incremental migration, no big-bang rewrite, constitutional compliance, enterprise readiness, and long-term scalability.
