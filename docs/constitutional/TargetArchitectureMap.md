# Wave 3.3.4 - Target Architecture Map

## 1. Target Constitutional Architecture

Target CareerOS V2 architecture:

```text
UI/API/Workers/Jobs
  -> IntelligenceOrchestrator
  -> StudentUnderstandingAuthority
  -> OptionGeneratorAuthority
  -> OutcomeTrackerAuthority
```

Adjacent constitutional authorities:

```text
IntelligenceOrchestrator
  -> DecisionAuthority
  -> ConfidenceAuthority
```

Core intelligence flow:

```text
UNDERSTAND -> GENERATE -> LEARN
```

Feedback flow:

```text
LEARN -> IntelligenceOrchestrator -> StudentUnderstandingAuthority
LEARN -> IntelligenceOrchestrator -> OptionGeneratorAuthority
LEARN -> IntelligenceOrchestrator -> DecisionAuthority
LEARN -> IntelligenceOrchestrator -> ConfidenceAuthority
```

## 2. Target Layer Model

```text
Product Entrypoints
  UI/API/workers/jobs/schedulers/webhooks

Meta Authority
  IntelligenceOrchestrator

Authority Facades
  StudentUnderstandingAuthority
  OptionGeneratorAuthority
  OutcomeTrackerAuthority
  DecisionAuthority
  ConfidenceAuthority

Authority Internals
  Existing engines, calculators, analyzers, scorers, simulators,
  trackers, validators, repositories, and local coordinators

Shared Neutral Layer
  Contracts, primitives, payload refs, event envelopes,
  configuration constants, non-intelligent utilities

Infrastructure
  Stores, event bus, audit ledger, metrics, tracing, policy store,
  idempotency store, dead-letter queues
```

## 3. IntelligenceOrchestrator

Target responsibility:

`IntelligenceOrchestrator` is the meta-authority. It owns coordination, not domain intelligence.

Owns:

- Request intake.
- Request classification.
- Authority routing.
- Cross-authority lifecycle.
- Orchestration state.
- Event dispatch.
- Learning signal routing.
- Response synthesis without creating new domain intelligence.
- Policy enforcement.
- Audit trail records.
- Observability and trace correlation.
- Idempotency and retry coordination.

Does not own:

- Student knowledge creation.
- Recommendation generation.
- Pathway or future creation.
- Outcome learning.
- Final decision arbitration.
- Global confidence authority behavior.
- Replacement of existing engines.

Target inputs:

- `RequestEnvelope`
- Async event envelopes.
- Authority responses.
- Learning signals.
- Feedback events.
- Status queries.

Target outputs:

- `AuthorityRouting`
- Lifecycle states.
- Orchestrated response envelope.
- Event dispatch records.
- Audit trail records.
- Policy decisions.

Allowed dependencies:

- Authority facade contracts.
- Authority registry.
- Policy engine.
- Event bus.
- Audit ledger.
- Lifecycle store.
- Snapshot store/index.
- Idempotency store.
- Observability infrastructure.
- Shared-neutral contracts.

Forbidden dependencies:

- Direct import of the 444 authority-owned internal intelligence files.
- Domain-specific ranking, assessment, simulation, or learning engines.
- Local fallback implementations of DecisionAuthority or ConfidenceAuthority behavior.

## 4. StudentUnderstandingAuthority

Target responsibility:

`StudentUnderstandingAuthority` owns UNDERSTAND.

Owns:

- Student profile input processing.
- Assessment interpretation.
- Signal extraction.
- Assessment validation and quality scoring.
- Archetype inference.
- Student model/belief construction.
- Student values, motivations, constraints, growth, identity, risk, bias, and similarity understanding.
- Student-understanding explanations.
- Application of orchestrator-routed learning signals to student understanding.

Does not own:

- Career option generation.
- Recommendation ranking.
- Pathway generation.
- Future simulation.
- Outcome learning.
- Cross-authority orchestration.
- Final decision arbitration.

Target inputs:

- `StudentProfileInput`
- `AssessmentInput`
- `ArchetypeInput`
- Behavior/evidence signals routed by orchestrator.
- Learning signals routed by orchestrator.

Target outputs:

- `StudentModelOutput`
- `StudentLifeProfile` or equivalent immutable understanding snapshot.
- `ConfidenceOutput` for understanding confidence where compliant with `ConfidenceAuthority`.
- Understanding explanations.
- Understanding events.

Allowed dependencies:

- Student-owned internal engines.
- Shared-neutral contracts.
- `ConfidenceAuthority` contract where confidence boundary requires it.

Forbidden dependencies:

- `OptionGeneratorAuthority` internals.
- `OutcomeTrackerAuthority` internals.
- Direct outcome stores.
- Direct option/recommendation engines.
- Direct cross-authority command calls.

## 5. OptionGeneratorAuthority

Target responsibility:

`OptionGeneratorAuthority` owns GENERATE.

Owns:

- Recommendation generation.
- Career option ranking and matching.
- Career fit.
- Career intelligence and taxonomy used for option generation.
- Pathway and roadmap generation.
- Future simulation.
- Market-aware option intelligence.
- Optionality, regret, utility, reality, counterfactual, and trade-off intelligence for options.
- Mentor/guidance intelligence when used for option guidance.
- Option explanations.
- Application of orchestrator-routed learning signals to generation behavior.

Does not own:

- Student knowledge creation.
- Raw assessment interpretation.
- Outcome learning.
- Cross-authority orchestration.
- Final decision arbitration when adjacent `DecisionAuthority` is required.
- Global confidence authority behavior when adjacent `ConfidenceAuthority` is required.

Target inputs:

- `RecommendationRequest`
- `PathwayRequest`
- `FutureSimulationRequest`
- Immutable student understanding snapshot from orchestrator.
- Career universe and market references.
- Learning context references routed by orchestrator.

Target outputs:

- `RankedOptionsOutput`
- Pathway/roadmap output snapshots.
- Future simulation output snapshots.
- `ExplanationOutput`
- Option generation events.

Allowed dependencies:

- Option-owned internal engines.
- Shared-neutral contracts.
- `DecisionAuthority` and `ConfidenceAuthority` only through approved contracts and orchestrator policy.

Forbidden dependencies:

- Direct imports of `StudentUnderstandingAuthority` internals.
- Direct imports of `OutcomeTrackerAuthority` internals.
- Pulling student data directly from student model engines.
- Pulling raw outcome records directly from outcome trackers.
- Sending learning signals point-to-point.

## 6. OutcomeTrackerAuthority

Target responsibility:

`OutcomeTrackerAuthority` owns LEARN.

Owns:

- Recommendation exposure tracking.
- Decision tracking.
- Action tracking.
- Outcome submissions.
- Outcome observations.
- Feedback ingestion.
- Outcome timelines.
- Quality metrics.
- Calibration reports.
- Learning signal generation.
- Outcome learning and performance evaluation.

Does not own:

- Student profile mutation outside orchestrator-routed learning.
- Recommendation generation.
- Option ranking.
- Cross-authority routing.
- Direct modification of another authority's state.

Target inputs:

- `OutcomeSubmission`
- `OutcomeObservation`
- Recommendation exposure events.
- Decision events.
- Action events.
- Feedback.
- Quality evidence.

Target outputs:

- Outcome records.
- Outcome observations.
- Quality metrics.
- Calibration reports.
- Learning signals.
- Feedback/outcome events.

Allowed dependencies:

- Outcome-owned internal engines.
- Shared-neutral contracts.
- Event/audit infrastructure through approved contracts.

Forbidden dependencies:

- Direct calls to student authority internals.
- Direct calls to option authority internals.
- Direct mutation of recommendation weights outside orchestrator-routed signal application.
- Point-to-point learning distribution.

## 7. Target Dependency Graph

Allowed:

```text
UI/API/Workers/Jobs
  -> IntelligenceOrchestrator public contract

IntelligenceOrchestrator
  -> StudentUnderstandingAuthority facade
  -> OptionGeneratorAuthority facade
  -> OutcomeTrackerAuthority facade
  -> DecisionAuthority facade
  -> ConfidenceAuthority facade

Authority Facade
  -> same-authority internal engines
  -> shared-neutral contracts

Authority Internal Engine
  -> same-authority internal engines
  -> shared-neutral contracts
```

Forbidden:

```text
StudentUnderstandingAuthority -> OptionGeneratorAuthority
StudentUnderstandingAuthority -> OutcomeTrackerAuthority
OptionGeneratorAuthority -> StudentUnderstandingAuthority
OptionGeneratorAuthority -> OutcomeTrackerAuthority
OutcomeTrackerAuthority -> StudentUnderstandingAuthority
OutcomeTrackerAuthority -> OptionGeneratorAuthority
UI/API/Worker/Job -> multiple authorities
Shared neutral utility -> authority internal engine
Authority internal engine -> IntelligenceOrchestrator
Public barrel -> multiple authority internals
```

## 8. Target State Stores

| Store | Owner | Purpose |
| --- | --- | --- |
| Orchestration lifecycle store | `IntelligenceOrchestrator` | Flow state, retries, idempotency, route state |
| Audit ledger | `IntelligenceOrchestrator` for cross-authority flows | Immutable allow/deny/output/event records |
| Student understanding snapshots | `StudentUnderstandingAuthority` | Immutable student model/profile outputs |
| Option generation snapshots | `OptionGeneratorAuthority` | Recommendations, paths, futures, explanations |
| Outcome records and learning signals | `OutcomeTrackerAuthority` | Outcomes, feedback, quality, calibration, learning |
| Decision audit/history | `DecisionAuthority` | Final decisions, arbitration, appeals |
| Confidence records | `ConfidenceAuthority` | Global confidence, uncertainty, reliability, calibration |

## 9. Target Runtime Modes

| Mode | Purpose |
| --- | --- |
| Modular monolith mode | Lowest-risk initial migration; orchestrator and authority facades run in same app/runtime and call preserved internal engines |
| Distributed authority mode | Future scaling option; same contracts allow authority services to scale separately |
| Async event mode | Used for long-running simulations, outcome learning, feedback, calibration, and backpressure |

The contracts must not depend on deployment mode.

## 10. Target Architecture Verdict

The final architecture is not a rewrite of the 444 intelligence systems. It is a constitutional boundary system around them.

Final target:

```text
Existing engines preserved
  -> wrapped by exactly one authority facade
  -> called through IntelligenceOrchestrator for cross-authority workflows
  -> governed by static import rules and runtime policy
  -> audited and observable at every authority boundary
```

This target supports zero data loss, incremental migration, 10M+ student scale, multi-team development, and enterprise governance.
