# Wave 3.3.3 - Dependency Governance Model

## 1. Purpose

This document defines the dependency governance model for CareerOS V2 constitutional ownership. It is architecture design only.

The model answers:

- Which modules may import which modules?
- Which dependency edges are forbidden?
- How should new intelligence modules be governed?
- How can 1000+ future intelligence modules evolve without ownership ambiguity?

## 2. Current Dependency Baseline

Fresh Wave 3.3.3 source scan:

| Metric | Count |
| --- | ---: |
| TypeScript files in `src/` | 802 |
| Intelligence files in ownership map | 444 |
| `StudentUnderstandingAuthority` files | 50 |
| `OptionGeneratorAuthority` files | 339 |
| `OutcomeTrackerAuthority` files | 55 |
| `IntelligenceOrchestrator` files | 0 |
| Direct imports into mapped intelligence files | 839 |
| Direct cross-authority imports | 4 |
| Direct non-owned imports into owned intelligence files | 393 |
| Non-owned files with transitive authority reach | 131 |
| Non-owned files reaching multiple authority domains | 2 |
| Circular authority dependencies | 0 |

The current dependency graph is not constitutionally enforceable because:

- The three domain authority facades do not exist in `src/`.
- `IntelligenceOrchestrator` does not exist in `src/`.
- Public/index files expose authority-owned internals.
- Four direct cross-authority imports already exist.

## 3. Layer Model

CareerOS dependencies should be governed by layer and authority.

```text
Product Entrypoints
  UI, API routes, workers, jobs, schedulers, webhooks

Meta Authority
  IntelligenceOrchestrator

Authority Facades
  StudentUnderstandingAuthority
  OptionGeneratorAuthority
  OutcomeTrackerAuthority
  DecisionAuthority
  ConfidenceAuthority

Authority Internals
  Existing engines, reasoners, scorers, simulators, evaluators, trackers

Shared Neutral Layer
  Contracts, primitive types, payload refs, event envelopes, config constants,
  pure utilities with no intelligence decisions

Infrastructure
  Stores, event bus, audit ledger, metrics, tracing, policy store
```

Governance rule:

```text
Dependencies may flow down through allowed layers.
Authority internals may not cross sideways into another authority.
```

## 4. Allowed Dependency Matrix

| Importer | Allowed dependencies |
| --- | --- |
| UI/API/workers/jobs | Orchestrator public client/contract for intelligence workflows; shared-neutral types |
| `IntelligenceOrchestrator` | Authority facade contracts, authority registry, policy engine, event bus, audit ledger, lifecycle store, shared-neutral contracts |
| `StudentUnderstandingAuthority` facade | Student-owned internals, shared-neutral contracts, approved `ConfidenceAuthority` contract only for confidence concerns |
| `OptionGeneratorAuthority` facade | Option-owned internals, shared-neutral contracts, approved `ConfidenceAuthority` and `DecisionAuthority` contracts only through orchestrator policy |
| `OutcomeTrackerAuthority` facade | Outcome-owned internals, shared-neutral contracts |
| Authority internal file | Same-authority internal files and shared-neutral utilities |
| `DecisionAuthority` | Decision-owned internals and shared-neutral contracts |
| `ConfidenceAuthority` | Confidence-owned internals and shared-neutral contracts |
| Shared-neutral file | Shared-neutral files only |
| Infrastructure file | Infrastructure contracts, shared-neutral types, and explicitly registered authority adapters |
| Test file | Test-only helpers and contract test harnesses; production-invalid imports must be reported as test-only exceptions |

## 5. Forbidden Dependency Matrix

| Importer | Forbidden dependency |
| --- | --- |
| `StudentUnderstandingAuthority` file | `OptionGeneratorAuthority` internal file |
| `StudentUnderstandingAuthority` file | `OutcomeTrackerAuthority` internal file |
| `OptionGeneratorAuthority` file | `StudentUnderstandingAuthority` internal file |
| `OptionGeneratorAuthority` file | `OutcomeTrackerAuthority` internal file |
| `OutcomeTrackerAuthority` file | `StudentUnderstandingAuthority` internal file |
| `OutcomeTrackerAuthority` file | `OptionGeneratorAuthority` internal file |
| Any authority internal file | `IntelligenceOrchestrator` implementation |
| Any authority internal file | Another authority facade for command/query calls |
| UI/API/workers/jobs | Multiple authority facades for one intelligence workflow |
| Shared-neutral file | Any authority internal engine or facade |
| Public barrel | Multiple authority internal namespaces unless it is the orchestrator public surface |
| Event handler | Direct command invocation of a non-owning authority |

Current concrete forbidden imports:

- `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts -> src/intelligence/student-model/StudentModelEngine.ts`
- `src/intelligence/mentor/MentorEngine.ts -> src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/recommendation-engine/RecommendationEngine.ts -> src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/regret-engine/RegretEngine.ts -> src/intelligence/student-model/StudentBelief.ts`

## 6. Public Import Surface Governance

Every public surface must have one owner.

Valid public surface types:

| Type | Rule |
| --- | --- |
| Orchestrator public surface | May coordinate multiple authorities |
| Authority facade public surface | Belongs to exactly one authority |
| Authority internal index | Importable only by same-authority files |
| Shared contract index | Contains contracts/types only; no ranking, assessment, learning, simulation, routing, or decision behavior |
| Test/example index | Not importable by production code |

Invalid public surface types:

- A barrel that exports engines from more than one authority.
- A barrel that exposes authority internals to UI/API/jobs.
- A shared utility index that contains scoring, ranking, assessment, or learning behavior.
- An example/test module that becomes a production dependency.

Current public surface risks:

| File | Risk |
| --- | --- |
| `src/intelligence/index.ts` | Transitive reach into `OptionGeneratorAuthority` and `StudentUnderstandingAuthority` |
| `src/career-fit/index.ts` | Exposes option-owned fit engines outside the authority facade |
| `src/career-intelligence/index.ts` | Exposes option-owned career intelligence outside the authority facade |
| `src/career-reality/index.ts` | Exposes option-owned career reality engines outside the authority facade |
| `src/assessment/questions/index.ts` | Exposes student-owned question engines outside the authority facade |
| `src/assessment/validation/index.ts` | Exposes student-owned validation engines outside the authority facade |

## 7. Dependency States

Every file with intelligence behavior should be in exactly one dependency governance state.

| State | Meaning |
| --- | --- |
| `authority-facade` | Public entrypoint for one authority |
| `authority-internal` | Internal implementation owned by one authority |
| `orchestrator-public` | Public meta-authority entrypoint |
| `orchestrator-internal` | Orchestration implementation detail |
| `shared-neutral` | No intelligence behavior; may be reused |
| `infrastructure` | Store, event, audit, metrics, tracing, or policy infrastructure |
| `legacy-shadow` | Existing intelligence behavior not yet behind an authority facade |
| `test-only` | Not importable by production code |
| `deprecated` | Existing but no new imports allowed |
| `forbidden` | Must not be imported or executed in production |

Wave 3.3 current baseline:

- 444 files are `legacy-shadow` until covered by authority facades.
- 0 files are `IntelligenceOrchestrator` implementation files.

## 8. Change Governance

### 8.1 New File Governance

A new file must be classified before merge if it performs any of:

- Assessment.
- Profile interpretation.
- Archetype inference.
- Confidence scoring.
- Student modeling.
- Recommendation generation.
- Ranking or matching.
- Career fit.
- Pathway or roadmap generation.
- Future simulation.
- Market intelligence.
- Optionality, regret, mentor, or decision intelligence.
- Outcome tracking.
- Feedback processing.
- Learning loop.
- Calibration or performance evaluation.
- Orchestration, routing, workflow management, or event coordination.

Required metadata:

- Owner authority.
- Public or internal status.
- Allowed importers.
- Allowed imports.
- Event and output ownership.
- Audit requirements.
- Contract version, if public.

### 8.2 Import Change Governance

Every new import edge is evaluated as:

| Edge type | Governance result |
| --- | --- |
| Same-authority internal import | Allowed |
| Authority internal to shared-neutral | Allowed |
| Cross-authority internal import | Block |
| UI/API/job to authority internal | Block for intelligence workflows |
| Authority internal to orchestrator | Block |
| Shared-neutral to authority file | Block |
| Public barrel to multiple authorities | Block or architecture review if orchestrator public surface |
| Test-only cross-authority import | Require test-only annotation and no production reachability |

### 8.3 Output Ownership Governance

Outputs must have a single owner:

| Output | Owner |
| --- | --- |
| Student model, profile, archetype, understanding confidence | `StudentUnderstandingAuthority` |
| Ranked options, recommendation explanation, pathway, roadmap, future simulation | `OptionGeneratorAuthority` |
| Outcome record, feedback event, learning signal, quality metric | `OutcomeTrackerAuthority` |
| Route, flow state, audit record, event dispatch record | `IntelligenceOrchestrator` |
| Final decision/arbitration output | `DecisionAuthority` |
| Global confidence/uncertainty/reliability output | `ConfidenceAuthority` |

## 9. Dependency Validation Workflow

The validation workflow:

1. Build source file list.
2. Build import/export graph.
3. Load ownership registry.
4. Resolve each file to layer and owner.
5. Resolve each import edge to importer owner/layer and target owner/layer.
6. Compare edge to allowed matrix.
7. Detect public barrels that expose owned internals.
8. Detect transitive multi-authority reach.
9. Detect new intelligence behavior without owner.
10. Detect duplicate cluster expansion.
11. Produce blocking report and governance dashboard metrics.

Required outputs:

- `directForbiddenEdges`
- `publicSurfaceViolations`
- `unownedIntelligenceFiles`
- `shadowAuthorityFiles`
- `authorityInternalExternalConsumers`
- `multiAuthorityBarrels`
- `contractVersionDrift`
- `eventOwnerDrift`
- `testOnlyExceptions`

## 10. Multi-Team Governance

For multi-team development:

| Team action | Governance requirement |
| --- | --- |
| Adds new assessment/profile module | Must declare `StudentUnderstandingAuthority` owner |
| Adds new recommendation/ranking module | Must declare `OptionGeneratorAuthority` owner |
| Adds new outcome/learning module | Must declare `OutcomeTrackerAuthority` owner |
| Adds routing/workflow/event lifecycle module | Must declare `IntelligenceOrchestrator` owner |
| Adds final selection/arbitration module | Must declare `DecisionAuthority` involvement |
| Adds global confidence/calibration module | Must declare `ConfidenceAuthority` involvement |
| Adds public barrel | Must prove single-authority or orchestrator public surface |
| Adds cross-authority workflow | Must enter through orchestrator contract |

Review ownership:

- Domain teams can own internal engines.
- Platform/architecture owns orchestrator, registry, policy, and governance rules.
- Authority owners approve public contracts and output ownership.
- Compliance reviewers approve new cross-authority workflows.

## 11. Scalability Governance

The model scales to 1000+ future intelligence modules by making ownership metadata mandatory and machine-checkable.

Scalability controls:

- File-level ownership registry.
- Capability-level authority mapping.
- Event-type owner mapping.
- Output-type owner mapping.
- Public surface classification.
- Per-authority internal dependency zones.
- Automated import graph validation.
- Automated drift detection.
- Blocking CI for critical violations.
- Dashboard trend metrics.

The number of intelligence modules can grow without ambiguity if every module is classified before merge and no module can import across authority boundaries without orchestrator routing.

## 12. Dependency Governance Verdict

The current repository has no circular authority dependency but does have four direct forbidden cross-authority imports and a broad public surface that can expose authority-owned internals.

The dependency governance model guarantees boundary clarity by:

1. Assigning every intelligence file exactly one owner.
2. Allowing authority internals to import only same-authority internals and shared-neutral code.
3. Allowing cross-authority workflows only through `IntelligenceOrchestrator`.
4. Treating public barrels as governed surfaces, not neutral convenience exports.
5. Blocking new unowned intelligence behavior before merge.
6. Separating shared contracts from intelligence behavior.

Under this model, no authority can bypass the orchestrator through imports, public barrels, events, workers, jobs, or shared utilities.
