# Wave 3.3.3 - Shadow Intelligence Elimination Plan

## 1. Purpose

This document designs the methodology for detecting and eliminating shadow intelligence growth in CareerOS V2. It is architecture design only.

Shadow intelligence means any source behavior that performs authority-owned intelligence without being governed by the proper constitutional owner and orchestrator pathway.

## 2. Current Shadow Intelligence Baseline

Wave 3.3 established:

| Authority bucket | Shadow files |
| --- | ---: |
| `StudentUnderstandingAuthority` | 50 |
| `OptionGeneratorAuthority` | 339 |
| `OutcomeTrackerAuthority` | 55 |
| `IntelligenceOrchestrator` | 0 |
| Total | 444 |

Current constitutional reality:

- `StudentUnderstandingAuthority` is not implemented in `src/`.
- `OptionGeneratorAuthority` is not implemented in `src/`.
- `OutcomeTrackerAuthority` is not implemented in `src/`.
- `IntelligenceOrchestrator` is not implemented in `src/`.
- Therefore all 444 discovered intelligence files remain shadow systems until covered by authority facades, registry ownership, policy, and audit.

## 3. Shadow Intelligence Definition

A file is shadow intelligence if it does one or more of the following without a constitutional owner facade:

- Interprets assessments.
- Builds or modifies student models.
- Infers archetypes.
- Calculates student-understanding confidence.
- Generates recommendations.
- Ranks or matches careers.
- Calculates career fit.
- Generates pathways, roadmaps, or future simulations.
- Produces market-aware intelligence.
- Produces regret, optionality, mentor, utility, or decision intelligence.
- Tracks outcomes.
- Processes feedback.
- Creates learning signals.
- Performs calibration or performance evaluation.
- Routes requests across authorities.
- Coordinates multi-authority workflows.
- Synthesizes outputs from multiple authority domains.

## 4. Current Shadow Categories

### 4.1 StudentUnderstandingAuthority Shadow Systems

Current count: 50.

Behavior groups:

- Assessment engines.
- Assessment validation and quality scoring.
- Question selection and generation.
- Profile generation, synthesis, interpretation, and insights.
- Archetype detection, evidence, confidence, stability, narrative, strengths, and risks.
- Student belief/model builders.
- Bayesian belief update engines.
- Identity, value evolution, personal growth, prospect theory, similar-student, and bias engines.

Examples:

- `src/assessment/assessment-engine.ts`
- `src/assessment/validation/assessment-validator.ts`
- `src/archetype/archetype-detection-engine.ts`
- `src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/student-model/StudentModelEngine.ts`
- `src/profile/profile-generator.ts`

### 4.2 OptionGeneratorAuthority Shadow Systems

Current count: 339.

Behavior groups:

- Recommendation generation, ranking, fusion, confidence, stability, and explanation.
- Career fit, matching, similarity, taxonomy, ontology, and graph intelligence.
- Career journey, pathway, roadmap, transition, and milestone generation.
- Future simulation, scenario generation, counterfactuals, and trajectories.
- Market intelligence, market signals, market learning, forecasting, trends, scarcity, opportunity, and risk adjustment.
- Optionality, regret, utility, real-options, value-of-information, and decision intelligence.
- Mentor intelligence, guidance, advice, and narrative systems.

Examples:

- `src/recommendation/career-recommendation-engine.ts`
- `src/intelligence/recommendation-engine/RecommendationEngine.ts`
- `src/intelligence/recommendation-fusion/recommendation-fusion-engine.ts`
- `src/career-fit/career-fit-engine.ts`
- `src/future-simulation/future-simulation-engine.ts`
- `src/intelligence/market-signal-intelligence/MarketIntelligenceEngine.ts`
- `src/intelligence/real-options-engine/RealOptionsEngine.ts`
- `src/intelligence/mentor/MentorEngine.ts`

### 4.3 OutcomeTrackerAuthority Shadow Systems

Current count: 55.

Behavior groups:

- Outcome tracking.
- Recommendation exposure tracking.
- Decision tracking.
- Action tracking.
- Feedback engines.
- Learning loops.
- Active learning.
- Calibration engines.
- Quality metrics.
- Outcome evidence, timelines, comparison, storage, and reporting.

Examples:

- `src/outcome-tracking/engines/outcome-tracking-engine.ts`
- `src/intelligence/outcome-tracking/outcome-tracking-engine.ts`
- `src/intelligence/outcome-learning/learning-signal-engine.ts`
- `src/intelligence/learning-loop/learning-loop-engine.ts`
- `src/intelligence/calibration/calibration-engine.ts`

### 4.4 Orchestrator Shadow Gap

Current count: 0 implemented orchestrator files.

The gap is not that there are shadow orchestrator files formally assigned to `IntelligenceOrchestrator`; the gap is that 55 local orchestration hotspots perform workflow coordination locally while no meta-authority exists to own cross-authority routing, lifecycle, state, event dispatch, and audit.

## 5. Detection Methodology

### 5.1 Behavior Classifier

A detector classifies files by behavior, not by name alone.

Signals:

- Exported function names.
- Class names.
- Input and output types.
- Imports.
- Comments and documented purpose.
- Use of ranking, scoring, recommendation, assessment, simulation, feedback, learning, routing, or orchestration language.
- Event ownership.
- Data model mutation.

Classification result:

| Field | Meaning |
| --- | --- |
| `detectedBehavior` | Assessment, recommendation, learning, orchestration, etc. |
| `constitutionalOwner` | Required authority owner |
| `confidence` | Detection confidence |
| `evidence` | Source paths, exported functions, imports, comments |
| `requiresReview` | Whether ambiguous behavior needs owner approval |

### 5.2 Ownership Registry Match

Every detected intelligence file is matched against the authority registry.

Violation cases:

- No registry entry.
- Multiple registry entries.
- Registry owner conflicts with behavior.
- File status is shared-neutral but behavior is intelligent.
- Public surface exposes internal authority behavior.
- Test-only file is reachable from production.

### 5.3 Import Graph Detector

The import graph detector finds:

- Direct authority-to-authority imports.
- Authority internal imported by non-owned files.
- Public barrels that expose authority internals.
- Transitive reach from feature modules to authority engines.
- Multi-authority public surfaces.
- Cycles inside and across authorities.

Current Wave 3.3.3 evidence:

- Direct cross-authority imports: 4.
- Non-owned direct imports into owned systems: 393.
- Non-owned transitive authority reach files: 131.
- Non-owned multi-authority reach files: 2.

### 5.4 Event Edge Detector

The event edge detector classifies event producers and consumers.

Shadow event violations:

- Authority event directly invokes another authority command.
- Learning signal bypasses `IntelligenceOrchestrator`.
- Event payload carries unversioned mutable domain state.
- Event has no authority owner.
- Event has no `flowId`, `requestId`, `correlationId`, `causationId`, `payloadHash`, `policyVersion`, or `authorityVersion`.
- Event handler creates assessment, recommendation, outcome, decision, or confidence output outside the proper owner.

### 5.5 Runtime Caller Detector

The runtime detector identifies calls to authority behavior without orchestrator context.

Violation signals:

- Missing authority capability token.
- Missing `flowId` or `traceId`.
- Missing `policyVersion`.
- Caller source is UI/API/worker/job when authority facade expects orchestrator.
- Authority output emitted without audit reference.
- Internal engine output returned directly to caller.

### 5.6 Duplicate Intelligence Detector

Duplicate clusters are detected by grouping files with overlapping behavior, inputs, and outputs.

Wave 3.3 duplicate clusters:

| Cluster | Owner |
| --- | --- |
| Recommendation generation/ranking/confidence/explanation | `OptionGeneratorAuthority` |
| Career path/pathway discovery, validation, comparison, explanation | `OptionGeneratorAuthority` |
| Future simulation/scenario/trajectory generation | `OptionGeneratorAuthority` |
| Market intelligence discovery/scoring/forecasting/adjustment | `OptionGeneratorAuthority` |
| Career fit/matching/similarity scoring | `OptionGeneratorAuthority` |
| Decision/utility/optionality/regret trade-off engines | `OptionGeneratorAuthority` |
| Assessment signal/quality/confidence scoring | `StudentUnderstandingAuthority` |
| Archetype inference/explanation/evidence/stability | `StudentUnderstandingAuthority` |
| Student profile/model/belief/value/growth/identity/risk understanding | `StudentUnderstandingAuthority` |
| Outcome tracking/event trackers | `OutcomeTrackerAuthority` |
| Feedback/learning loop/active learning engines | `OutcomeTrackerAuthority` |
| Calibration/quality/performance evaluation | `OutcomeTrackerAuthority` |

Duplicate behavior is allowed only when the owning authority facade defines the relationship between specialized engines and final authority output.

### 5.7 Ownership Drift Detector

Ownership drift occurs when a file begins doing work outside its registered authority.

Drift signals:

- New imports from another authority.
- New outputs owned by another authority.
- New event types owned by another authority.
- New ranking/scoring/assessment/learning behavior in a shared-neutral file.
- New public export from internal engine.
- New cross-authority workflow in a feature module.
- New tests/examples that normalize production-forbidden direct engine use.

### 5.8 Orphan Intelligence Detector

An orphan intelligence system is an authority-owned file that is not reachable from:

- Its authority facade.
- A registered authority internal path.
- A contract test.
- An approved legacy path.

Orphan states:

| State | Meaning |
| --- | --- |
| Unreachable | Not used by any governed entrypoint |
| Public-only | Reachable only through ungoverned public barrel |
| Test-only | Used only by tests/examples |
| Legacy-only | Used only by deprecated paths |
| Ambiguous | Multiple possible owners or no clear owner |

Orphan systems must be reported because they may contain stale or divergent intelligence.

## 6. Elimination Workflow

This workflow is methodological. It does not prescribe implementation changes in this document.

### Stage 1: Baseline Freeze

Record:

- The 444 known intelligence files.
- Their assigned authority owners.
- The 4 direct forbidden imports.
- The 393 non-owned direct imports into owned systems.
- The 131 transitive non-owned reach paths.
- The 12 duplicate clusters.
- The 55 local orchestration hotspots.

Any future diff is measured against this baseline.

### Stage 2: Registry Coverage

Every intelligence file receives:

- Authority owner.
- Internal/public/shared/test classification.
- Allowed importers.
- Allowed imports.
- Capability classification.
- Event/output ownership.
- Legacy-shadow status.

### Stage 3: Facade Coverage

A file ceases to be shadow only when:

- It is registered to exactly one authority.
- Its external use is mediated by the authority facade.
- Its cross-authority participation is mediated by `IntelligenceOrchestrator`.
- Its outputs include authority owner, version, lineage, and audit reference.
- Its events use approved event envelopes.

### Stage 4: Public Surface Closure

Public barrels are reclassified as:

- Authority facade public surfaces.
- Authority internal indexes.
- Shared-neutral contract indexes.
- Test-only surfaces.
- Deprecated legacy surfaces.

Any surface reaching multiple authorities must be routed through the orchestrator or marked invalid for production intelligence workflows.

### Stage 5: Runtime Shadow Detection

Runtime policy records:

- Calls without orchestrator context.
- Calls with wrong authority token.
- Calls missing audit context.
- Authority output without owner.
- Event-command bypass attempts.
- Direct learning signal delivery attempts.

### Stage 6: Drift Monitoring

Each pull request and release reports:

- Shadow file count.
- New intelligence files.
- Ownership changes.
- New public surfaces.
- New duplicate cluster members.
- New cross-authority imports.
- New runtime denial categories.

## 7. Future Violation Prevention Strategy

Future shadow intelligence is prevented by:

1. Requiring ownership metadata for every new intelligence file.
2. Blocking cross-authority imports.
3. Blocking shared-neutral files from making intelligence decisions.
4. Blocking public barrels that expose multiple authorities.
5. Requiring orchestrator context for authority facade calls.
6. Routing learning signals through orchestrator.
7. Auditing every authority output.
8. Monitoring duplicate cluster growth.
9. Detecting test/example patterns that can leak into production.
10. Reporting orphan intelligence systems.

## 8. Scalability Validation

For 10M+ students:

- Shadow detection must operate on source metadata and audit events, not in-memory per-student state.
- Runtime calls carry `studentId` partition keys, idempotency keys, and payload references.
- Audit records store hashes and references, not large sensitive payloads.
- Learning signals are routed asynchronously and idempotently.

For 1000+ future intelligence modules:

- File-level registry prevents ownership ambiguity.
- Capability-level mapping prevents duplicate authority outputs.
- Public surface classification prevents accidental exposure.
- Duplicate cluster detector tracks semantic overlap at scale.
- Orphan detector prevents dead or divergent engines from accumulating.

For multi-team development:

- Teams can add internal engines inside their authority boundary.
- Cross-authority workflows require orchestrator contract review.
- Public surfaces require authority owner approval.
- Dashboards show drift by team, authority, module, and release.

## 9. Shadow Intelligence Elimination Verdict

The current repository has 444 shadow intelligence systems because no Wave 3 authority facades or `IntelligenceOrchestrator` exist in `src/`.

Shadow intelligence growth can be eliminated only by making ownership explicit, machine-checkable, and enforced at both source and runtime boundaries.

The elimination model is:

```text
Detect behavior
  -> assign exactly one authority
  -> validate imports and public surfaces
  -> require facade coverage
  -> require orchestrator routing for cross-authority workflows
  -> audit runtime calls and events
  -> block drift
```

Under this model, no new shadow authority can grow silently, no duplicate cluster can expand without owner visibility, and no orphan intelligence system can remain invisible to governance.
