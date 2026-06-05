# Wave 3.3.3 - Constitutional Compliance Framework

## 1. Purpose

This document defines the enterprise compliance framework for CareerOS constitutional intelligence ownership. It is architecture design only.

The framework covers:

- Compliance scoring.
- CI/CD validation.
- Pull request validation.
- Architecture review gates.
- Governance dashboards.
- Audit logging.
- Enterprise scalability.

## 2. Compliance Scope

Compliance applies to any code, contract, event, workflow, or data output that performs:

- UNDERSTAND behavior owned by `StudentUnderstandingAuthority`.
- GENERATE behavior owned by `OptionGeneratorAuthority`.
- LEARN behavior owned by `OutcomeTrackerAuthority`.
- Cross-authority routing, state, event dispatch, synthesis, audit, or policy behavior owned by `IntelligenceOrchestrator`.
- Final decision/arbitration behavior owned by `DecisionAuthority`.
- Global confidence/reliability/calibration behavior owned by `ConfidenceAuthority`.

Compliance is evaluated at:

- Source file level.
- Import graph level.
- Public API level.
- Contract and event level.
- Runtime authority call level.
- Audit and observability level.
- Pull request and release level.

## 3. Current Compliance Baseline

| Metric | Current value |
| --- | ---: |
| Intelligence files discovered | 444 |
| Domain authority facade files in `src/` | 0 |
| `IntelligenceOrchestrator` files in `src/` | 0 |
| Shadow intelligence systems | 444 |
| Direct forbidden cross-authority imports | 4 |
| Circular authority dependencies | 0 |
| Local orchestration hotspots | 55 |
| Duplicate intelligence clusters | 12 |
| Direct non-owned imports into owned systems | 393 |
| Non-owned files with transitive authority reach | 131 |
| Non-owned files reaching multiple authorities | 2 |

Baseline verdict:

- Current source is not constitutionally enforceable.
- Direct circular dependency risk is currently absent.
- Direct forbidden edge risk is present.
- Structural shadow authority risk is pervasive because the authority facades and orchestrator are missing.

## 4. Compliance Score

Compliance is scored from 0 to 100.

| Category | Points | Passing condition |
| --- | ---: | --- |
| Ownership coverage | 20 | Every intelligence file has exactly one registered authority owner |
| Orchestrator routing | 20 | Every multi-authority workflow enters through `IntelligenceOrchestrator` |
| Import boundary integrity | 15 | No forbidden source imports or multi-authority public barrels |
| Contract and event governance | 10 | Commands, queries, outputs, and events are versioned and owner-attributed |
| Runtime policy enforcement | 15 | Authority calls require orchestrator context and fail closed |
| Auditability | 10 | Every authority call, denial, event, and output has audit lineage |
| Shadow and drift control | 5 | New intelligence behavior cannot appear without owner classification |
| Scale readiness | 5 | Idempotency, partitioning, async processing, and replay are present |

Compliance grades:

| Score | Grade | Meaning |
| ---: | --- | --- |
| 95-100 | A | Constitutional enforcement is production-grade |
| 85-94 | B | Minor non-critical issues; no forbidden edges |
| 70-84 | C | Operationally usable but not enterprise complete |
| 50-69 | D | Significant governance gaps |
| 0-49 | F | Constitutional compliance not enforceable |

Hard fail conditions:

- Any production direct authority-to-authority import.
- Any new intelligence file without owner.
- Any production authority call without orchestrator context.
- Any UI/API/job workflow calling multiple authorities directly.
- Any event that directly commands another authority outside orchestrator.
- Any missing audit record for critical authority output.

If a hard fail condition exists, the release cannot be considered constitutionally compliant even if the numeric score is otherwise high.

## 5. CI/CD Ownership Validation

CI/CD validation stages:

### 5.1 Source Inventory Stage

Checks:

- List all TypeScript files.
- Detect new, moved, or deleted files.
- Detect intelligence behavior in changed files.
- Verify registry ownership.
- Verify file classification.

Blocks:

- New intelligence file without owner.
- Deleted or moved owned file without registry update.
- Shared-neutral file containing intelligence behavior.

### 5.2 Import Graph Stage

Checks:

- Resolve TypeScript imports and exports.
- Compare every edge with allowed dependency matrix.
- Detect cross-authority imports.
- Detect multi-authority public barrels.
- Detect production reachability from tests/examples.
- Detect cycles.

Blocks:

- Direct production cross-authority import.
- Authority internal imported by UI/API/job for intelligence workflow.
- Shared-neutral import of authority-owned behavior.
- Public surface reaching multiple authorities outside orchestrator.

### 5.3 Contract Stage

Checks:

- Commands, queries, outputs, and events include version fields.
- Owner authority is explicit.
- Payload references and hashes are present for sensitive or durable data.
- Backward compatibility rules are followed.
- Deprecated contracts are not used by new callers.

Blocks:

- Required field removal without major version.
- Unversioned authority output.
- Unowned event type.
- Deprecated contract used by new production path.

### 5.4 Runtime Policy Test Stage

Checks:

- Authority facade rejects calls without orchestrator context.
- Forbidden edges are denied.
- Learning signals route through orchestrator.
- Events cannot issue direct authority commands.
- Audit records are produced for allowed and denied calls.

Blocks:

- Authority command succeeds without orchestrator-issued context.
- Policy denial has no audit record.
- Event-command bypass succeeds.

### 5.5 Release Compliance Stage

Release report includes:

- Compliance score.
- Direct violation count.
- Shadow file count.
- New intelligence files.
- Ownership changes.
- Public surface changes.
- Duplicate cluster changes.
- Runtime policy test result.
- Audit completeness result.

Release is blocked when any hard fail condition exists.

## 6. Pull Request Validation

Every pull request touching intelligence code must answer:

| Question | Required answer |
| --- | --- |
| Does this add or modify intelligence behavior? | Yes/no |
| Which authority owns the behavior? | Exactly one authority |
| Does this create a new public surface? | Yes/no plus owner |
| Does this add a cross-authority workflow? | If yes, orchestrator route required |
| Does this add or change an event? | Event owner and schema version |
| Does this add decision or confidence behavior? | DecisionAuthority or ConfidenceAuthority involvement |
| Does this affect duplicate clusters? | Cluster and owner |
| Does this affect learning signals? | Orchestrator-routed signal path |
| Does this affect audit lineage? | Audit fields and persistence |

Required automated PR outputs:

- Changed intelligence files.
- Owner mapping diff.
- Import edge diff.
- Public surface diff.
- Contract/event diff.
- Violation summary.
- Compliance score delta.

Reviewer gates:

| Gate | Reviewer |
| --- | --- |
| New authority-owned public contract | Authority owner |
| New cross-authority workflow | Orchestrator/platform owner |
| New final decision/arbitration behavior | DecisionAuthority owner |
| New global confidence/calibration behavior | ConfidenceAuthority owner |
| New public barrel or shared index | Architecture governance |
| New learning loop or calibration path | OutcomeTrackerAuthority owner |
| New recommendation/ranking/simulation path | OptionGeneratorAuthority owner |
| New assessment/profile/archetype path | StudentUnderstandingAuthority owner |

## 7. Architecture Review Gates

Architecture review is required for:

- Any new authority facade.
- Any new cross-authority route.
- Any public surface that reaches authority-owned internals.
- Any new event category.
- Any new output type consumed by multiple authorities.
- Any new data store shared by authorities.
- Any new learning signal target.
- Any new decision or confidence module.
- Any duplicate cluster expansion beyond current owner scope.
- Any attempt to mark an intelligent file as shared-neutral.

Review must verify:

- Single owner.
- Allowed dependency direction.
- Orchestrator routing.
- Runtime policy enforcement.
- Auditability.
- Contract versioning.
- Privacy class.
- Scale characteristics.

## 8. Governance Dashboards

Dashboards should show real-time and release-level constitutional health.

### 8.1 Ownership Dashboard

Metrics:

- Files by authority.
- Shadow files.
- Unowned intelligence files.
- Owner changes by release.
- Duplicate cluster membership.
- Orphan intelligence systems.

### 8.2 Dependency Dashboard

Metrics:

- Direct forbidden imports.
- Cross-authority cycles.
- Public multi-authority surfaces.
- Non-owned imports into owned internals.
- Transitive authority reach from non-owned files.
- Test-only exception count.

### 8.3 Orchestrator Coverage Dashboard

Metrics:

- Percentage of intelligence workflows entering orchestrator.
- Authority calls with valid orchestrator context.
- Authority calls denied by policy.
- Direct call attempts.
- Workflow types by authority route.
- Orchestrator latency and failure rate.

### 8.4 Runtime Policy Dashboard

Metrics:

- `policy.allowed` count.
- `policy.denied` count.
- `shadow-call-detected` count.
- `forbidden-interaction-detected` count.
- Denials by authority.
- Denials by caller type.
- Denials by policy version.
- Dead-lettered learning signals.

### 8.5 Audit Dashboard

Metrics:

- Audit completeness percentage.
- Missing payload hash count.
- Missing policy version count.
- Missing authority version count.
- Replay success rate.
- Audit write failures.
- Flows without final audit record.

## 9. Audit Logging Framework

Every authority interaction produces an immutable audit record.

Required audit fields:

- `auditId`
- `flowId`
- `requestId`
- `traceId`
- `studentId`
- `source`
- `operation`
- `authority`
- `capability`
- `contractVersion`
- `schemaVersion`
- `authorityVersion`
- `policyVersion`
- `inputRef`
- `inputHash`
- `outputRef`
- `outputHash`
- `eventRefs`
- `decision`
- `denialReason`, if denied
- `privacyClass`
- `idempotencyKey`
- `startedAt`
- `completedAt`
- `durationMs`

Audit rules:

- Raw sensitive payloads are not written directly to audit logs.
- Payload references and hashes are mandatory for reproducibility.
- Denials are audited with the same rigor as successful calls.
- Event dispatch and dead-lettering are audited.
- Learning signal routing is audited from origin to target authority.
- Audit records are immutable after finalization.

## 10. Enterprise Governance Operating Model

Governance roles:

| Role | Responsibility |
| --- | --- |
| Constitutional owner | Maintains constitution and authority ownership rules |
| Orchestrator owner | Maintains routing, policy, lifecycle, audit, and event enforcement |
| Domain authority owner | Approves authority contracts, outputs, and internal module ownership |
| Adjacent authority owner | Approves decision and confidence authority interactions |
| Platform owner | Maintains CI/CD validators, dashboards, registry, and runtime guards |
| Product engineering owner | Ensures workflows enter orchestrator |
| Compliance reviewer | Reviews auditability, privacy, and enterprise policy |

Governance cadence:

- PR-level validation for every change.
- Release-level compliance report.
- Monthly duplicate cluster review.
- Quarterly authority ownership review.
- Incident review for every runtime forbidden interaction.
- Contract deprecation review before major version changes.

## 11. Scalability Validation

### 11.1 10M+ Students

Compliance architecture supports 10M+ students when:

- Requests are idempotent.
- Events are partitioned by `studentId` or `flowId` when ordering matters.
- Payloads use durable references and hashes.
- Orchestrator instances are stateless.
- Authority state is owned by the authority, not by orchestrator memory.
- Audit writes are durable and append-only.
- Async workflows support backpressure and dead-letter handling.

### 11.2 1000+ Intelligence Modules

The framework supports 1000+ modules when:

- Ownership registry is mandatory.
- Capability mapping is mandatory.
- Public surface classification is mandatory.
- Import graph validation is automated.
- Duplicate cluster growth is tracked.
- Unowned intelligence is a hard fail.

### 11.3 Multi-Team Development

The framework supports multi-team development when:

- Teams can add same-authority internals without cross-authority permission.
- Public contracts require authority owner approval.
- Cross-authority workflows require orchestrator approval.
- Decision and confidence authority involvement is explicit.
- Dashboards show team-level ownership drift.

### 11.4 Multi-Year Evolution

The framework supports multi-year evolution when:

- Contracts are versioned.
- Deprecated contracts have sunset windows.
- Policy versions are auditable.
- Ownership history is preserved.
- Replay can reconstruct old flows from audit records.
- New authority capabilities can be added without breaking existing routes.

## 12. Compliance Guarantee Model

Constitutional compliance is guaranteed only when all of the following are true:

1. CI blocks new unowned intelligence files.
2. CI blocks direct cross-authority production imports.
3. CI blocks public surfaces that expose multiple authorities outside orchestrator.
4. Runtime facades reject calls without orchestrator-issued context.
5. Event handlers cannot command another authority directly.
6. Learning signals are routed through orchestrator.
7. Authority outputs carry owner, version, lineage, and audit references.
8. Audit records are immutable and complete.
9. Dashboards alert on drift, denials, shadow calls, and duplicate expansion.
10. Release gates fail closed on hard fail conditions.

## 13. Compliance Framework Verdict

Current repository state is not constitutionally enforceable because all 444 intelligence systems are shadow until authority facades and the orchestrator exist.

The compliance framework provides an enterprise-ready guarantee model by combining:

- Ownership registry.
- Static dependency validation.
- Contract and event validation.
- Runtime authority guardrails.
- CI/CD blocking gates.
- PR governance.
- Audit logging.
- Compliance dashboards.
- Scalability controls.

Once implemented in blocking mode, this framework prevents authority bypass, eliminates ownership ambiguity, stops shadow intelligence growth, and provides auditable enterprise governance for long-term CareerOS evolution.
