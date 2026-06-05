# Wave 3.3.4 - File Migration Strategy

## 1. Purpose

This document defines the file migration strategy for all discovered intelligence modules. It is planning only.

No files are moved, deleted, modified, merged, or deprecated by this document.

## 2. Source Basis

The file-level source of truth is `docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md`, which contains 444 discovered intelligence implementation files and assigns each file to exactly one of:

- `StudentUnderstandingAuthority`
- `OptionGeneratorAuthority`
- `OutcomeTrackerAuthority`

`docs/constitutional/Wave3_3_AuthorityInventory.md` provides the grouped file inventory.

## 3. Migration Action Definitions

| Action | Meaning in this migration |
| --- | --- |
| KEEP | Preserve file and current behavior without changing ownership path. Used for already valid shared-neutral or adjacent authority files. |
| WRAP | Preserve file in place and expose it only through its owning authority facade. This is the default action for current intelligence modules. |
| MOVE | Physically relocate file into a new authority folder. This is not allowed in early migration waves and is optional after parity. |
| MERGE | Consolidate duplicate behavior after facade parity, usage telemetry, and owner approval. Not a Wave 1-3 action. |
| DEPRECATE | Stop production callers from importing a file or public surface directly. This applies first to access paths, not engine implementations. |

## 4. Global File Strategy

Every one of the 444 discovered intelligence implementation files receives this initial strategy:

```text
Primary action: WRAP
Physical move: NO
Delete: NO
Merge: NO in early waves
Destination: Owning authority facade from Wave3_3_IntelligenceOwnershipMap.md
```

Why:

- The user objective requires zero data loss and no big-bang rewrite.
- Existing engines contain current product intelligence.
- Moving or merging before facade parity creates unnecessary product and data risk.
- Constitutional ownership can be established logically before physical file relocation.

## 5. Authority-Level Classification

| Current owner | File count | Primary action | Destination |
| --- | ---: | --- | --- |
| `StudentUnderstandingAuthority` | 50 | WRAP | `StudentUnderstandingAuthority` facade and internal engine registry |
| `OptionGeneratorAuthority` | 339 | WRAP | `OptionGeneratorAuthority` facade and internal engine registry |
| `OutcomeTrackerAuthority` | 55 | WRAP | `OutcomeTrackerAuthority` facade and internal engine registry |
| `IntelligenceOrchestrator` | 0 | CREATE LAYER in migration plan | Meta-authority; no existing implementation file to move |

## 6. StudentUnderstandingAuthority File Groups

All files in these groups are classified as WRAP with destination `StudentUnderstandingAuthority`.

| Current group | Count | Strategy |
| --- | ---: | --- |
| `src/archetype` | 11 | WRAP as archetype inference, evidence, stability, narrative, strength, and risk internals |
| `src/assessment` | 12 | WRAP as assessment processing, signal extraction, question, validation, quality, reliability, and confidence internals |
| `src/intelligence/bayesian-belief-engine` | 6 | WRAP as belief update, evidence, posterior, contradiction, confidence, and narrative internals |
| `src/intelligence/identity-development-engine` | 2 | WRAP as identity understanding internals |
| `src/intelligence/personal-growth-engine` | 2 | WRAP as growth understanding internals |
| `src/intelligence/prospect-theory-engine` | 4 | WRAP as bias/risk/decision-state understanding internals |
| `src/intelligence/similar-student-engine` | 3 | WRAP as student similarity and peer-profile understanding internals |
| `src/intelligence/student-model` | 3 | WRAP as student belief/model construction internals |
| `src/intelligence/value-evolution-engine` | 2 | WRAP as value evolution understanding internals |
| `src/profile` | 4 | WRAP as profile synthesis, interpretation, insights, and generation internals |
| `src/intelligence/adaptive-mentor-foundation` | 1 | WRAP as student knowledge/context understanding internal |

File-level rule:

Every file listed under `StudentUnderstandingAuthority` in `Wave3_3_AuthorityInventory.md` receives:

```text
Action: WRAP
Destination: StudentUnderstandingAuthority
Allowed future secondary action: MERGE only after facade parity and duplicate-cluster review
Forbidden early action: MOVE, DELETE, direct public exposure
```

## 7. OptionGeneratorAuthority File Groups

All files in these groups are classified as WRAP with destination `OptionGeneratorAuthority`.

| Current group | Count | Strategy |
| --- | ---: | --- |
| `src/career-fit` | 5 | WRAP as career fit, matching, confidence, breakdown, and explanation internals |
| `src/career-intelligence` | 4 | WRAP as career intelligence, evidence, analysis, and insight internals |
| `src/career-journeys` | 9 | WRAP as journey, transition, turning point, similarity, matching, and pathway internals |
| `src/career-reality` | 8 | WRAP as daily-life, work-environment, burnout, culture, satisfaction, and reality-gap internals |
| `src/career-taxonomy` | 5 | WRAP as career graph, relationship, similarity, taxonomy, and transition internals |
| `src/decision-intelligence` | 4 | WRAP as option decision-support internals; final decision authority behavior must be routed through `DecisionAuthority` |
| `src/future-simulation` | 5 | WRAP as future scenario, trajectory, outcome, and simulation explanation internals |
| `src/intelligence` option-owned files | 264 | WRAP as option generation, market, recommendation, future, decision-support, utility, optionality, regret, mentor, and validation internals |
| `src/knowledge-graph` | 1 | WRAP as option-supporting graph intelligence internal |
| `src/market-data-ingestion` | 6 | WRAP as market signal ingestion and processing internals |
| `src/mentor-intelligence` | 5 | WRAP as mentor-derived option guidance internals |
| `src/ontology` option-owned files | 5 | WRAP as option-supporting ontology internals |
| `src/optionality-intelligence` | 5 | WRAP as optionality and future option internals |
| `src/recommendation` | 4 | WRAP as recommendation generation and explanation internals |
| `src/regret-intelligence` | 5 | WRAP as regret scenario, factor, mitigation, and explanation internals |
| `src/utility-intelligence` | 4 | WRAP as utility elicitation, scoring, and explanation internals |

File-level rule:

Every file listed under `OptionGeneratorAuthority` in `Wave3_3_AuthorityInventory.md` receives:

```text
Action: WRAP
Destination: OptionGeneratorAuthority
Allowed future secondary action: MERGE for duplicate clusters after facade parity and telemetry
Forbidden early action: MOVE, DELETE, direct StudentUnderstandingAuthority import, direct OutcomeTrackerAuthority import
```

## 8. OutcomeTrackerAuthority File Groups

All files in these groups are classified as WRAP with destination `OutcomeTrackerAuthority`.

| Current group | Count | Strategy |
| --- | ---: | --- |
| `src/intelligence/active-learning` | 6 | WRAP as active learning and uncertainty/evidence-gap internals |
| `src/intelligence/calibration` | 8 | WRAP as calibration and performance evaluation internals |
| `src/intelligence/learning-loop` | 5 | WRAP as learning loop, confidence adjustment, population learning, and outcome feedback internals |
| `src/intelligence/outcome-evidence-engine` | 3 | WRAP as outcome evidence and explanation internals |
| `src/intelligence/outcome-learning` | 8 | WRAP as recommendation, decision, signal, feedback, weight, and reporting learning internals |
| `src/intelligence/outcome-tracking` | 8 | WRAP as outcome event, store, tracker, timeline, comparison, quality, and student growth internals |
| `src/intelligence/outcome-tracking-engine` | 1 | WRAP as outcome tracking engine internal |
| `src/ontology/outcome-ontology` | 4 | WRAP as outcome metric, dimension, assessment, and repository internals |
| `src/outcome-tracking/engines` | 11 | WRAP as action, decision, feedback, cohort, privacy, quality, recommendation, and outcome tracking internals |

File-level rule:

Every file listed under `OutcomeTrackerAuthority` in `Wave3_3_AuthorityInventory.md` receives:

```text
Action: WRAP
Destination: OutcomeTrackerAuthority
Allowed future secondary action: MERGE for duplicate outcome tracking/calibration/learning clusters after audit parity
Forbidden early action: MOVE, DELETE, direct StudentUnderstandingAuthority mutation, direct OptionGeneratorAuthority mutation
```

## 9. Direct Violation File Strategy

These four files receive WRAP plus a mandatory dependency-replacement plan. The files are not moved or deleted.

| File | Current owner | Current violation | Primary action | Destination |
| --- | --- | --- | --- | --- |
| `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts` | `OptionGeneratorAuthority` | Imports `src/intelligence/student-model/StudentModelEngine.ts` | WRAP and replace direct dependency with orchestrator-routed snapshot contract | `OptionGeneratorAuthority` |
| `src/intelligence/mentor/MentorEngine.ts` | `OptionGeneratorAuthority` | Imports `src/intelligence/student-model/StudentBelief.ts` | WRAP and replace direct dependency with student snapshot/query contract | `OptionGeneratorAuthority` |
| `src/intelligence/recommendation-engine/RecommendationEngine.ts` | `OptionGeneratorAuthority` | Imports `src/intelligence/student-model/StudentBelief.ts` | WRAP and replace direct dependency with student snapshot contract | `OptionGeneratorAuthority` |
| `src/intelligence/regret-engine/RegretEngine.ts` | `OptionGeneratorAuthority` | Imports `src/intelligence/student-model/StudentBelief.ts` | WRAP and replace direct dependency with student snapshot contract | `OptionGeneratorAuthority` |

## 10. Public Surface Strategy

Public surfaces and barrels are not always part of the 444 implementation-file map, but they are critical migration paths.

| Public surface type | Initial action | Future action |
| --- | --- | --- |
| Multi-authority public barrel such as `src/intelligence/index.ts` | DEPRECATE for production intelligence imports | Replace with orchestrator public surface |
| Single-domain barrels such as assessment, career-fit, career-intelligence, career-reality indexes | DEPRECATE direct production access after facade parity | Replace with authority facade public surface |
| Test/example direct engine imports | KEEP as test-only during transition | Annotate and prevent production reachability |
| Shared contracts/types with no intelligence behavior | KEEP | Allow under shared-neutral rules |

## 11. Duplicate Cluster Strategy

Duplicate clusters are not merged in early migration waves. They are wrapped first.

| Duplicate cluster | Owner | File count | Initial action | Later action |
| --- | --- | ---: | --- | --- |
| Recommendation generation/ranking/confidence/explanation | `OptionGeneratorAuthority` | 73 | WRAP | MERGE candidates after parity and telemetry |
| Career path/pathway discovery, validation, comparison, explanation | `OptionGeneratorAuthority` | 64 | WRAP | MERGE candidates after parity and owner review |
| Future simulation/scenario/trajectory generation | `OptionGeneratorAuthority` | 40 | WRAP | MERGE candidates after simulation parity |
| Market intelligence discovery/scoring/forecasting/adjustment | `OptionGeneratorAuthority` | 127 | WRAP | MERGE candidates after market output lineage validation |
| Career fit/matching/similarity scoring | `OptionGeneratorAuthority` | 36 | WRAP | MERGE candidates after fit output parity |
| Decision/utility/optionality/regret trade-off engines | `OptionGeneratorAuthority` | 129 | WRAP | MERGE candidates after DecisionAuthority boundary validation |
| Assessment signal/quality/confidence scoring | `StudentUnderstandingAuthority` | 31 | WRAP | MERGE candidates after assessment parity |
| Archetype inference/explanation/evidence/stability | `StudentUnderstandingAuthority` | 19 | WRAP | MERGE candidates after archetype output parity |
| Student profile/model/belief/value/growth/identity/risk understanding | `StudentUnderstandingAuthority` | 29 | WRAP | MERGE candidates after snapshot parity |
| Outcome tracking/event trackers | `OutcomeTrackerAuthority` | 21 | WRAP | MERGE candidates after audit and idempotency validation |
| Feedback/learning loop/active learning engines | `OutcomeTrackerAuthority` | 24 | WRAP | MERGE candidates after learning signal validation |
| Calibration/quality/performance evaluation | `OutcomeTrackerAuthority` | 22 | WRAP | MERGE candidates after calibration parity |

## 12. Move Strategy

No current intelligence module receives immediate MOVE classification.

Physical relocation may be considered only after:

1. Authority facade parity is proven.
2. Traffic has been redirected through orchestrator.
3. Import graph has no direct production dependency on the old path.
4. Audit lineage proves output continuity.
5. Rollback plan exists.
6. Ownership registry can map old path to new path during transition.

Recommended migration stance:

```text
Logical ownership first.
Physical relocation later, optional, and only when it reduces operational risk.
```

## 13. Deprecation Strategy

Deprecation applies first to access paths, not to intelligence engines.

Deprecate:

- Direct production imports of authority internals.
- Direct cross-authority imports.
- Multi-authority public barrels.
- UI/API/job direct multi-authority workflows.
- Event handlers that command another authority directly.

Do not deprecate:

- Internal engines until facade parity and telemetry prove safe consolidation.
- Existing decision/confidence authority files.
- Test fixtures needed for parity validation.

## 14. File Migration Verdict

The file migration strategy is conservative by design:

```text
444 intelligence modules
  -> WRAP behind owning authority facade
  -> keep physical files in place during migration
  -> redirect callers through IntelligenceOrchestrator
  -> deprecate direct shadow access paths
  -> consider merge/move only after parity, telemetry, audit, and owner approval
```

This satisfies zero data loss, incremental migration, and no big-bang rewrite.
