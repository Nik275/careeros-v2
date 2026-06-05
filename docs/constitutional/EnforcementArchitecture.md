# Wave 3.3.3 - Enforcement Architecture

## 1. Objective

This document designs the constitutional enforcement architecture for CareerOS V2. It does not implement code, generate stubs, or move files.

The goal is to guarantee that all intelligence systems obey the ownership model defined by:

```text
StudentUnderstandingAuthority
OptionGeneratorAuthority
OutcomeTrackerAuthority
IntelligenceOrchestrator
```

The enforcement architecture must preserve existing intelligence modules while preventing:

- Authority-to-authority command calls.
- Direct imports across authority boundaries.
- Public barrels or utilities exposing authority-owned internals.
- Runtime calls to authority behavior without orchestrator authorization.
- Shadow intelligence growth.
- Ownership drift over time.

## 2. Enforcement Principles

| Principle | Meaning |
| --- | --- |
| Fail closed | A cross-authority request without explicit policy approval is rejected. |
| One owner per intelligence behavior | Every assessment, recommendation, outcome, learning, routing, scoring, or simulation behavior has exactly one constitutional owner. |
| Orchestrator as sole cross-authority caller | Any workflow involving multiple authorities must enter through `IntelligenceOrchestrator`. |
| Facades as authority boundaries | External callers interact with authority facades, never internal engines. |
| Internal engines stay internal | Existing engines remain preserved, but their callers are restricted by owner and facade rules. |
| Shared code is non-intelligent | Shared utilities and contracts must not rank, recommend, assess, learn, route, or decide. |
| Audit everything | Every authority call, policy decision, event, denial, and version is recorded. |
| Static plus runtime enforcement | Compile-time checks prevent invalid dependencies; runtime guards prevent invalid calls. |

## 3. Compile-Time Enforcement

Compile-time enforcement prevents boundary violations before code is merged or deployed.

### 3.1 Authority Ownership Registry

The central registry is the source of truth for file ownership.

Registry entries should include:

| Field | Purpose |
| --- | --- |
| `filePath` | Source file path relative to repository root |
| `authority` | One of the four constitutional authority owners |
| `classification` | Internal engine, facade, contract, event, store, worker, test, or shared-neutral |
| `capabilities` | Assessment, recommendation, ranking, simulation, learning, orchestration, confidence, decision, etc. |
| `publicSurface` | Whether the file may be imported outside the authority |
| `allowedImporters` | Authorities, layers, or explicit files allowed to import it |
| `allowedImports` | File groups this file may import |
| `contractVersion` | Contract version when file is a public authority contract |
| `policyVersion` | Constitutional ruleset used to validate the entry |
| `status` | Active, legacy-shadow, deprecated, forbidden, or review-required |

Registry coverage requirement:

- Every file in `Wave3_3_IntelligenceOwnershipMap.md` must appear in the registry.
- Every new intelligence file must be assigned an authority before merge.
- Every public barrel that reaches authority-owned files must be classified as either owned public facade, internal authority barrel, or invalid.

### 3.2 Static Dependency Rules

The static dependency validator builds the TypeScript import graph and compares each edge with the registry.

Allowed imports:

| Importing layer | May import |
| --- | --- |
| UI/API/workers/jobs | `IntelligenceOrchestrator` public contract/client only for intelligence workflows |
| `IntelligenceOrchestrator` | Authority facade contracts, authority registry, policy engine, lifecycle state, event bus, audit ledger, observability, shared contracts |
| Authority facade | Own authority internal engines, own stores, shared-neutral contracts, approved adjacent authority contracts through orchestrator policy only |
| Authority internal engine | Same-authority internal files and shared-neutral utilities |
| Shared-neutral code | Other shared-neutral code only |
| Tests | Test utilities and contract test harnesses; production cross-authority imports must still be reported separately |

Forbidden imports:

| Importing layer | Forbidden import |
| --- | --- |
| UI/API/workers/jobs | Any authority internal engine for cross-authority intelligence workflows |
| `StudentUnderstandingAuthority` files | `OptionGeneratorAuthority` or `OutcomeTrackerAuthority` internal files |
| `OptionGeneratorAuthority` files | `StudentUnderstandingAuthority` or `OutcomeTrackerAuthority` internal files |
| `OutcomeTrackerAuthority` files | `StudentUnderstandingAuthority` or `OptionGeneratorAuthority` internal files |
| Authority internal engine | `IntelligenceOrchestrator` implementation |
| Shared-neutral code | Any authority facade or internal engine |
| Any production file | Broad multi-authority public barrel such as a mixed `src/intelligence/index.ts` surface |

### 3.3 Public Surface Rules

Every public import surface must be one of:

1. `orchestrator-public`: Public orchestration entrypoint.
2. `authority-facade-public`: Public facade for exactly one authority.
3. `authority-internal`: Importable only inside its authority.
4. `shared-contract`: Shared type/contract code with no intelligence behavior.
5. `test-only`: Not importable from production code.

Any public surface that reaches multiple authorities is invalid unless it is the `IntelligenceOrchestrator` public surface.

Current evidence:

- `src/intelligence/index.ts` reaches both `OptionGeneratorAuthority` and `StudentUnderstandingAuthority`.
- This is a multi-authority public surface risk and must be treated as blocked for production intelligence imports under the future enforcement model.

### 3.4 Contract Isolation

Authority contracts may reference:

- Immutable snapshots.
- Payload references.
- Versioned event envelopes.
- Authority-owned output IDs.
- Audit references.

Authority contracts must not expose:

- Internal engine classes.
- Mutable domain state from another authority.
- Direct helper functions that allow another authority to reconstruct private logic.
- Unversioned output shapes.

For example, `OptionGeneratorAuthority` consumes `StudentModelOutput` or `StudentLifeProfile` snapshot references routed by `IntelligenceOrchestrator`; it must not import `queryStudentBelief` from `StudentUnderstandingAuthority` internals.

### 3.5 Static Enforcement Output

The compile-time validator produces:

- Direct forbidden import list.
- Public barrel exposure list.
- Multi-authority public surface list.
- Unowned intelligence file list.
- New intelligence file without owner list.
- Authority internal file imported by external file list.
- Circular dependency list.
- Contract version and event version drift list.

Blocking severity:

| Severity | Example | Build behavior |
| --- | --- | --- |
| Critical | Direct authority-to-authority production import | Block |
| Critical | New intelligence file without owner | Block |
| Critical | UI/API imports authority internals for multi-authority workflow | Block |
| High | Public barrel reaches multiple authorities | Block for production imports |
| High | Shared utility performs ranking/recommendation/assessment/learning | Block until owned |
| Medium | Test/example direct import normalizes production-invalid pattern | Warn or require test-only annotation |
| Medium | Duplicate intelligence cluster expands without owner confirmation | Review gate |

## 4. Runtime Enforcement

Runtime enforcement prevents invalid requests even when static checks miss a path or when code executes through dynamic imports, external calls, jobs, webhooks, or older entrypoints.

### 4.1 Orchestrator Ingress Gate

All intelligence workflows enter through `IntelligenceOrchestrator`.

Ingress responsibilities:

1. Accept `RequestEnvelope`.
2. Validate `contractVersion`, `requestId`, `flowId`, `traceId`, `studentId`, `source`, `privacyClass`, `idempotencyKey`, and `policyContext`.
3. Classify requested operation as UNDERSTAND, GENERATE, LEARN, DECIDE, CONFIDENCE, or multi-step workflow.
4. Build `AuthorityRouting`.
5. Check route against allowed and forbidden edge matrix.
6. Persist lifecycle state and initial audit record.
7. Dispatch to authority facade only if policy allows.

### 4.2 Authority Facade Guard

Each authority facade requires a valid orchestrator call context.

Required runtime context:

| Field | Purpose |
| --- | --- |
| `caller` | Must be `IntelligenceOrchestrator` for authority commands |
| `flowId` | Orchestration lifecycle correlation |
| `requestId` | Idempotent request identity |
| `traceId` | Distributed trace identity |
| `studentId` | Student partition and policy scope |
| `policyVersion` | Constitutional ruleset used for authorization |
| `authorityRouteId` | Route approved by orchestrator |
| `capability` | Authority operation being invoked |
| `issuedAt` and `expiresAt` | Short-lived authority authorization window |
| `auditRef` | Initial audit ledger record |

If this context is missing, expired, mismatched, or not issued by the orchestrator, the facade rejects the call and emits a policy denial event.

### 4.3 Capability Tokens

The orchestrator issues short-lived capability tokens for authority operations.

Token rules:

- Scoped to one authority.
- Scoped to one request or one approved batch.
- Scoped to named capability, such as `CREATE_STUDENT_MODEL`, `GENERATE_RECOMMENDATIONS`, or `RECORD_OUTCOME`.
- Bound to `flowId`, `studentId`, `policyVersion`, and `authorityVersion`.
- Non-transferable between authorities.
- Invalid for authority-to-authority commands.

Capability tokens are not application auth tokens. They are constitutional authorization proofs for authority calls.

### 4.4 Runtime Policy Engine

Policy checks:

| Check | Denies when |
| --- | --- |
| Caller check | Authority command caller is not orchestrator |
| Route check | Requested authority is not in `AuthorityRouting.allowedAuthorities` |
| Edge check | Requested edge is forbidden, such as `OptionAuthority -> StudentAuthority` |
| Capability check | Requested operation is outside token capability |
| Contract check | Contract version is unsupported or sunset |
| Payload check | Payload lacks required snapshot, payload hash, privacy class, or lineage |
| Event check | Event target attempts point-to-point authority command |
| Ownership check | File/module identity does not match registered authority |
| Audit check | Audit ledger record cannot be created |

Fail-closed behavior:

- If policy cannot be loaded, deny.
- If registry cannot resolve authority, deny.
- If audit write fails for a critical workflow, deny or queue in a controlled retry state.
- If a forbidden edge is attempted, deny and emit `policy.denied` plus `forbidden-interaction-detected`.

### 4.5 Event Bus Enforcement

Events are allowed for lifecycle, audit, learning, and async processing. Events must not become hidden authority-to-authority commands.

Event enforcement:

- Every event has `sourceAuthority`, `target`, `schemaVersion`, `flowId`, `requestId`, `correlationId`, `causationId`, `payloadRef`, `payloadHash`, `policyVersion`, `authorityVersion`, `privacyClass`, and `idempotencyKey`.
- Authority-emitted events go to the event bus or orchestrator inbox, not directly to another authority command handler.
- Learning events from `OutcomeTrackerAuthority` are routed by orchestrator.
- Events with command semantics must be reclassified as orchestrator commands.

### 4.6 Runtime Shadow Call Detection

Shadow calls are detected when an authority-owned behavior executes without valid orchestrator context.

Detection signals:

- Missing `flowId`, `traceId`, or `policyVersion`.
- Missing authority capability token.
- Caller source is UI/API/worker/job/test harness in production.
- Authority operation emits output without an audit reference.
- Authority event lacks owner or version.
- Internal engine output leaves authority boundary without facade wrapping.

Runtime response:

1. Deny if in blocking mode.
2. Emit policy event.
3. Write audit record.
4. Attach source module, caller identity, authority owner, capability, and route.
5. Alert governance dashboard for repeated attempts.

## 5. Dependency Enforcement Model

Allowed dependency graph:

```text
UI/API/Workers/Jobs
  -> IntelligenceOrchestrator
  -> Authority Facades
  -> Same-Authority Internal Engines
  -> Shared-Neutral Contracts/Utilities

Outcome Events
  -> IntelligenceOrchestrator
  -> Learning Signal Router
  -> Target Authority Facade
```

Forbidden dependency graph:

```text
StudentUnderstandingAuthority -> OptionGeneratorAuthority
StudentUnderstandingAuthority -> OutcomeTrackerAuthority
OptionGeneratorAuthority -> StudentUnderstandingAuthority
OptionGeneratorAuthority -> OutcomeTrackerAuthority
OutcomeTrackerAuthority -> StudentUnderstandingAuthority
OutcomeTrackerAuthority -> OptionGeneratorAuthority
UI/API/Worker/Job -> Multiple Authorities
Shared Utility -> Authority Internal Engine
Authority Internal Engine -> IntelligenceOrchestrator
Authority Internal Engine -> Other Authority Internal Engine
```

Adjacent authority routing:

```text
IntelligenceOrchestrator -> DecisionAuthority
IntelligenceOrchestrator -> ConfidenceAuthority
Domain Authority -> ConfidenceAuthority only through approved authority contract or orchestrator policy
```

No domain authority may create a shadow replacement for `DecisionAuthority` or `ConfidenceAuthority`.

## 6. Authority Registry

The authority registry resolves the current constitutional owner, public contract, runtime facade, policy rules, and observability metadata for each authority.

Registry responsibilities:

- Map authority ID to public facade.
- Map file path to authority owner.
- Map capability to authority owner.
- Map event type to event owner.
- Map output type to output owner.
- Map command/query type to allowed caller.
- Validate allowed dependencies.
- Record authority health and version.
- Provide policy engine with allowed and forbidden edges.

Registry records:

| Authority ID | Facade | Owns |
| --- | --- | --- |
| `student-understanding` | `StudentUnderstandingAuthority` | Student profile, assessment, archetype, belief/model, student confidence |
| `option-generator` | `OptionGeneratorAuthority` | Recommendations, paths, roadmaps, futures, market, regret, mentor, option explanations |
| `outcome-tracker` | `OutcomeTrackerAuthority` | Outcomes, feedback, learning, calibration, quality metrics |
| `intelligence-orchestrator` | `IntelligenceOrchestrator` | Routing, lifecycle, event dispatch, state, audit, policy enforcement |
| `decision-authority` | `DecisionAuthority` | Final decision, arbitration, selection, appeal, decision audit |
| `confidence-authority` | `ConfidenceAuthority` | Global confidence, reliability, uncertainty, source trust, calibration contracts |

## 7. Ownership Validation Engine

The ownership validation engine is the automatic verification layer for constitutional compliance.

Inputs:

- Authority ownership registry.
- TypeScript import graph.
- Public export graph.
- Authority contracts.
- Event taxonomy.
- File behavior classifications from Wave 3.3.
- Runtime call and event audit records.
- Pull request diff.

Validation checks:

| Check | Description |
| --- | --- |
| File owner check | Every intelligence file has exactly one owner |
| Import edge check | Every import edge is allowed by owner/layer rules |
| Public surface check | Public barrels do not expose multi-authority internals |
| Contract check | Commands, queries, outputs, and events use approved versions |
| Event edge check | Event targets do not encode direct authority commands |
| Shadow behavior check | New ranking, assessment, learning, simulation, routing, or scoring behavior is owned |
| Orchestrator bypass check | UI/API/workers/jobs do not call authorities directly for intelligence workflows |
| Runtime context check | Authority calls carry orchestrator-issued context |
| Duplicate drift check | Duplicate clusters do not expand without owner confirmation |
| Orphan check | Intelligence behavior is not unreachable from a facade or orchestrated flow |

Outputs:

- Blocking violation report.
- Review-required report.
- Ownership drift report.
- Orchestrator coverage report.
- Shadow intelligence report.
- Compliance score input.

## 8. Enforcement Modes

| Mode | Use | Behavior |
| --- | --- | --- |
| Observe | Initial rollout and legacy inventory | Record violations, do not block runtime calls |
| Warn | Transitional governance | Warn in CI and runtime, block critical new violations |
| Block | Production constitutional enforcement | Block critical and high-severity violations |
| Quarantine | Incident response | Disable or isolate violating routes until reviewed |

For constitutional guarantee, production must run in `Block` mode for:

- Direct authority-to-authority imports.
- New unowned intelligence files.
- Authority command calls without orchestrator context.
- UI/API/worker/job multi-authority workflows outside orchestrator.
- Event-command edges that bypass orchestrator.

## 9. Observability and Audit

Every enforcement decision emits:

- `policy.allowed`
- `policy.denied`
- `shadow-call-detected`
- `forbidden-interaction-detected`
- `ownership-drift-detected`
- `authority-route-created`
- `authority-call-started`
- `authority-call-completed`
- `authority-call-failed`
- `audit-record-created`

Required metrics:

- Direct forbidden import count.
- Runtime forbidden call attempts.
- Shadow call attempts by file/module.
- Orchestrator route coverage percentage.
- Authority facade coverage percentage.
- Public multi-authority surface count.
- Unowned intelligence file count.
- Duplicate cluster growth.
- Audit completeness percentage.
- Policy denial rate.
- Dead-lettered learning signal count.

## 10. Enforcement Architecture Verdict

The constitutional enforcement architecture has two mandatory layers:

1. Compile-time enforcement prevents invalid source dependencies, unowned intelligence, public multi-authority barrels, and ownership drift before merge.
2. Runtime enforcement prevents invalid authority calls, missing orchestrator context, forbidden event-command edges, and unaudited outputs during execution.

The combination closes the current bypass paths:

- The 4 direct `OptionGeneratorAuthority -> StudentUnderstandingAuthority` imports are blocked by static import rules.
- The 393 non-owned imports into owned intelligence files are controlled by public surface classification.
- The 131 non-owned transitive authority reach paths are controlled by export graph validation.
- The 444 shadow intelligence files are converted from ungoverned behavior into authority-owned internal engines only when covered by registry, facade, policy, and audit rules.

Constitutional compliance can be guaranteed only when both layers are implemented and set to blocking enforcement for production paths.
