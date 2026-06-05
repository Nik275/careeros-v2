# Wave 3.3.1 - IntelligenceOrchestrator Blueprint

**Date:** 2026-06-05  
**Repository:** `C:/Users/a/Projects/careeros-v2`  
**Status:** Architecture design only. No production code changes.  
**Constitutional source:** `docs/constitutional/CAREEROS_CONSTITUTION.md`

## 1. Source Basis

This blueprint is based on a complete read of:

- `docs/constitutional/CAREEROS_CONSTITUTION.md`
- `docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md`
- `docs/constitutional/Wave3_3_AuthorityInventory.md`
- `docs/constitutional/Wave3_3_OwnershipViolations.md`
- `docs/constitutional/Wave3_3_ShadowIntelligenceReport.md`
- `docs/constitutional/Wave3_3_MigrationReadiness.md`
- `docs/constitutional/Wave3_3_FinalVerdict.md`

Additional source patterns inspected:

- `src/intelligence/decision/IDecisionAuthority.ts`
- `src/intelligence/decision/DecisionAuthority.ts`
- `src/intelligence/decision/DecisionEvents.ts`
- `src/intelligence/decision/DecisionTypes.ts`
- `src/intelligence/confidence/IConfidenceAuthority.ts`
- `src/intelligence/confidence/ConfidenceAuthority.ts`
- `src/types/student-life-profile.ts`
- `src/assessment/assessment-types.ts`
- `src/recommendation/recommendation-types.ts`
- `src/intelligence/outcome-tracking/outcome-types.ts`
- `src/intelligence/outcome-tracking/outcome-event-engine.ts`
- `src/intelligence/outcome-tracking/outcome-store.ts`
- `src/assessment/assessment-engine.ts`
- `src/recommendation/career-recommendation-engine.ts`
- `prisma/schema.prisma`

## 2. Current Reality

Wave 3.3 established the current constitutional state:

| Area | Current evidence |
| --- | --- |
| StudentUnderstandingAuthority scope | 50 implementation files |
| OptionGeneratorAuthority scope | 339 implementation files |
| OutcomeTrackerAuthority scope | 55 implementation files |
| IntelligenceOrchestrator implementation files | 0 |
| Total discovered intelligence files | 444 |
| Shadow systems | 444 of 444 until routed behind constitutional authority facades |
| Direct cross-authority imports | 4 OptionGeneratorAuthority files importing StudentUnderstandingAuthority-owned student-model files |
| Direct circular authority dependencies | 0 |

The design goal is not to delete or replace existing intelligence systems. The design goal is to define the missing meta-authority that coordinates them through constitutional ownership boundaries.

## 3. Constitutional Role

`IntelligenceOrchestrator` is the meta-authority for CareerOS intelligence. It owns orchestration, not domain intelligence.

The constitutional intelligence flow is:

```text
UNDERSTAND -> GENERATE -> LEARN
```

Authority ownership remains:

| Authority | Owns | Primary output |
| --- | --- | --- |
| `StudentUnderstandingAuthority` | Assessment, profile interpretation, archetype inference, student modeling, student beliefs, values, constraints, and understanding confidence | `StudentLifeProfile` and related understanding snapshots |
| `OptionGeneratorAuthority` | Career options, recommendations, ranking, matching, pathways, roadmaps, market-aware guidance, future simulation, optionality, regret, utility, career reality | Recommendations, paths, futures, option explanations |
| `OutcomeTrackerAuthority` | Outcome tracking, feedback, learning loops, calibration, quality, performance evaluation | Outcome records, learning signals, calibration reports |
| `IntelligenceOrchestrator` | Cross-authority routing, lifecycle, state, conflict resolution, synthesis, learning distribution, constitutional enforcement | Orchestrated intelligence responses and audit trail |

Adjacent authorities remain constitutionally relevant:

| Authority | Boundary |
| --- | --- |
| `DecisionAuthority` | Final decision operations, arbitration, selection, and generic decision logic where decision authority owns the behavior |
| `ConfidenceAuthority` | Confidence, uncertainty, reliability, calibration, and confidence explanation where the confidence authority owns the behavior |

## 4. IntelligenceOrchestrator Responsibilities

The orchestrator must be the only sanctioned cross-authority coordination layer.

### 4.1 Core Responsibilities

| Responsibility | Required behavior |
| --- | --- |
| Request classification | Classify each request as UNDERSTAND, GENERATE, LEARN, ORCHESTRATE, DECIDE, or CONFIDENCE before routing. |
| Authority routing | Route domain work to exactly one owning authority. |
| Flow planning | Build an execution plan for multi-authority workflows. |
| Lifecycle coordination | Manage request state from intake through completion, failure, retry, or async continuation. |
| Boundary enforcement | Prevent authority behavior from being performed outside its constitutional owner. |
| Snapshot passing | Pass `StudentLifeProfile` and other authority outputs as immutable snapshots, not as direct engine dependencies. |
| Synthesis | Compose outputs from multiple authorities into a user-facing response without creating new domain intelligence. |
| Conflict handling | Detect incompatible authority outputs and route final decision/arbitration work to `DecisionAuthority` when required. |
| Learning distribution | Receive learning signals from `OutcomeTrackerAuthority` and route them back to understanding, generation, decision, or confidence systems through sanctioned interfaces. |
| Auditability | Produce an immutable trace of every authority call, policy decision, input hash, output hash, event, and version. |
| Observability | Emit metrics, traces, logs, and events for latency, failures, retries, confidence, authority health, and constitutional violations. |
| Idempotency | Deduplicate repeated requests and events using request IDs, event IDs, and flow IDs. |
| Scale isolation | Keep orchestration instances stateless enough for horizontal scaling and isolate durable state into stores and event infrastructure. |

### 4.2 Explicit Non-Responsibilities

| Non-responsibility | Owner |
| --- | --- |
| Creating student knowledge | `StudentUnderstandingAuthority` |
| Generating recommendations, careers, paths, futures, market-aware option guidance, or option explanations | `OptionGeneratorAuthority` |
| Learning from outcomes or producing calibration signals | `OutcomeTrackerAuthority` |
| Making final selections, arbitration, or generic decision operations | `DecisionAuthority` |
| Calculating confidence, uncertainty, reliability, or source trust | `ConfidenceAuthority` |
| Replacing existing engines | No authority. Existing engines remain behind owning authority facades. |

## 5. IntelligenceOrchestrator Interfaces

This section defines interface shape as architecture, not implementation code.

### 5.1 Public Orchestrator Interface

The orchestrator public contract should follow the existing authority pattern shown by `IDecisionAuthority.ts`: stable public methods, factory creation, lifecycle events, metrics, configuration, health checks, and disposal.

| Interface group | Method contract | Purpose |
| --- | --- | --- |
| Full flow | `runIntelligenceFlow(request)` | Executes UNDERSTAND -> GENERATE -> LEARN registration when a student needs career intelligence. |
| Understand-only | `understandStudent(request)` | Routes raw student, assessment, profile, behavior, or feedback-signal input to `StudentUnderstandingAuthority`. |
| Generate-only | `generateOptions(request)` | Requires an existing understanding snapshot and routes option generation to `OptionGeneratorAuthority`. |
| Learn-only | `recordOutcome(request)` | Routes recommendation, decision, action, outcome, or feedback events to `OutcomeTrackerAuthority`. |
| Decision support | `supportDecision(request)` | Coordinates option outputs with `DecisionAuthority` when final decision, arbitration, selection, or appeal behavior is required. |
| Learning distribution | `applyLearningSignals(request)` | Routes learning and calibration signals back to owning authorities through orchestrated signal contracts. |
| Flow state | `getFlowStatus(flowId)` | Returns lifecycle state, authority steps, current status, and error/retry state. |
| Audit | `getAuditTrail(flowId)` | Returns immutable audit references and lineage metadata. |
| Events | `on(eventType, handler)` | Allows internal subscribers to observe orchestration lifecycle events. |
| Health | `healthCheck()` | Checks orchestrator, authority registry, state stores, event bus, policy engine, and authority availability. |
| Metrics | `getMetrics()` | Returns throughput, latency, error, retry, policy, and authority metrics. |

### 5.2 Request Envelope

Every orchestrated request should use a common envelope so 10M+ student scale, audit, retries, and privacy controls are uniform.

| Field | Purpose |
| --- | --- |
| `requestId` | Client or server idempotency key for the incoming request. |
| `flowId` | Stable orchestration run identifier. |
| `studentId` | Student scope and partition key. |
| `sessionId` | User session or assessment session scope. |
| `requestType` | `UNDERSTAND`, `GENERATE`, `LEARN`, `FULL_FLOW`, `DECIDE`, or `CONFIDENCE`. |
| `source` | UI, API, worker, webhook, scheduled job, admin, or authority event. |
| `payloadRef` | Reference to durable payload when payload is too large or sensitive for event transport. |
| `payloadHash` | Audit hash for reproducibility without exposing raw payload in event logs. |
| `consentContext` | Privacy and learning-consent status for outcome and learning operations. |
| `policyContext` | Feature flags, authority versions, constitutional ruleset version, and environment. |
| `traceId` | Distributed tracing ID propagated across all authority calls. |
| `deadline` | Request timeout and cancellation boundary. |

### 5.3 Response Envelope

Every orchestrator response should be lineage-aware.

| Field | Purpose |
| --- | --- |
| `flowId` | Link to the orchestration run. |
| `status` | Completed, partially completed, queued, failed, rejected, or requires follow-up. |
| `result` | User-facing or API-facing result synthesized from authority outputs. |
| `authorityOutputs` | References to immutable authority snapshots. |
| `confidence` | Confidence value or confidence reference produced through `ConfidenceAuthority`. |
| `explanations` | Authority-owned explanations only. |
| `auditRef` | Audit ledger reference. |
| `events` | Event IDs emitted during the flow. |
| `warnings` | Policy warnings, partial data warnings, or degraded authority warnings. |

### 5.4 Authority Facade Contracts

These are the authority contracts the orchestrator should depend on. The orchestrator should not depend on the 444 implementation files directly.

| Authority | Required facade capabilities |
| --- | --- |
| `StudentUnderstandingAuthority` | Build understanding from raw input, update understanding from learning signals, return `StudentLifeProfile`, return archetype/profile/belief snapshots, explain understanding outputs, expose metrics and health. |
| `OptionGeneratorAuthority` | Generate recommendations, generate paths, simulate futures, compare or explain options when comparison is part of option generation, apply market and reality intelligence, consume learning signals, expose metrics and health. |
| `OutcomeTrackerAuthority` | Register recommendation exposure, record decision/action/outcome events, create outcome records, generate learning signals, generate calibration and quality reports, expose metrics and health. |
| `DecisionAuthority` | Decide, rank, compare, arbitrate, select, reconsider, appeal, explain decision outputs, expose history, events, metrics, and health. |
| `ConfidenceAuthority` | Calculate confidence, uncertainty, reliability, calibration, source trust, aggregate confidence, expose history and health. |

## 6. Request Lifecycle Design

### 6.1 Lifecycle States

| State | Meaning |
| --- | --- |
| `RECEIVED` | Request accepted and assigned `flowId`. |
| `CLASSIFYING` | Request type and constitutional owner are being determined. |
| `REJECTED_BY_POLICY` | Request attempted forbidden ownership behavior. |
| `LOADING_CONTEXT` | Student, session, profile, prior decisions, and relevant snapshots are loaded. |
| `UNDERSTANDING` | `StudentUnderstandingAuthority` is active. |
| `UNDERSTANDING_COMPLETED` | Understanding snapshot is persisted and emitted. |
| `GENERATING` | `OptionGeneratorAuthority` is active. |
| `GENERATION_COMPLETED` | Options, paths, futures, or guidance snapshot is persisted and emitted. |
| `DECISION_SUPPORTING` | `DecisionAuthority` is active for final selection or arbitration if needed. |
| `TRACKING_REGISTERED` | `OutcomeTrackerAuthority` has registered baseline, recommendation, or decision tracking. |
| `SYNTHESIZING` | Orchestrator packages authority-owned outputs into a response. |
| `COMPLETED` | Synchronous flow is done. |
| `QUEUED_FOR_ASYNC_LEARNING` | Outcome or learning work continues asynchronously. |
| `FAILED_RETRYABLE` | Failure can be retried safely through idempotency. |
| `FAILED_FINAL` | Failure is terminal and audit records why. |

### 6.2 Full Career Intelligence Flow

1. Intake receives student request, assessment submission, onboarding completion, profile refresh, recommendation request, or outcome event.
2. Orchestrator creates or resumes `flowId`, validates `requestId`, and stores an idempotency record.
3. Policy engine classifies the request and verifies the allowed authority path.
4. Context loader retrieves durable student, assessment, profile, career, decision, and outcome references.
5. `StudentUnderstandingAuthority` creates or updates the understanding snapshot.
6. Orchestrator stores the understanding snapshot reference and emits an understanding event.
7. `OptionGeneratorAuthority` receives the understanding snapshot and generates options, paths, futures, explanations, and option-level risk/utility/market/reality intelligence.
8. Orchestrator stores the generation snapshot reference and emits a generation event.
9. If a final selection, arbitration, or decision-readiness operation is requested, orchestrator calls `DecisionAuthority`.
10. If confidence, uncertainty, reliability, or calibration is needed at the orchestration level, orchestrator calls `ConfidenceAuthority`; authority-owned systems may also delegate to `ConfidenceAuthority`.
11. Orchestrator registers recommendation exposure, decision state, or baseline tracking with `OutcomeTrackerAuthority`.
12. Orchestrator synthesizes the response without creating new domain intelligence.
13. Audit ledger finalizes input/output hashes, authority versions, event IDs, policy decisions, and timings.
14. Async learning continues through outcome events and learning-signal distribution.

## 7. Student -> Understanding -> Option Generation -> Outcome Tracking Flow

### 7.1 Synchronous User Path

```text
User or API
  -> IntelligenceOrchestrator
  -> policy classification
  -> context load
  -> StudentUnderstandingAuthority
  -> StudentLifeProfile snapshot
  -> OptionGeneratorAuthority
  -> recommendations, paths, futures, explanations
  -> optional DecisionAuthority
  -> optional ConfidenceAuthority
  -> OutcomeTrackerAuthority registration
  -> IntelligenceOrchestrator response synthesis
  -> User or API
```

### 7.2 Asynchronous Learning Path

```text
Outcome event or feedback
  -> IntelligenceOrchestrator
  -> OutcomeTrackerAuthority
  -> outcome record, learning signal, calibration report
  -> IntelligenceOrchestrator learning router
  -> StudentUnderstandingAuthority receives understanding update signal
  -> OptionGeneratorAuthority receives generation calibration signal
  -> DecisionAuthority receives decision calibration signal when applicable
  -> ConfidenceAuthority receives confidence calibration signal when applicable
```

### 7.3 Existing Type Anchors

| Flow stage | Existing source evidence |
| --- | --- |
| Raw assessment input | `src/assessment/assessment-types.ts` defines `AssessmentQuestion`, `AssessmentResponse`, `AssessmentSignal`, and `DimensionScore`. |
| Understanding output | `src/types/student-life-profile.ts` defines `StudentLifeProfile`. |
| Recommendation output | `src/recommendation/recommendation-types.ts` defines `CareerRecommendation`, `RecommendationSet`, and `CareerOption`. |
| Outcome learning output | `src/intelligence/outcome-tracking/outcome-types.ts` defines `OutcomeEvent`, `LearningSignal`, `StudentOutcomeRecord`, and outcome interfaces. |
| Decision output | `src/intelligence/decision/DecisionTypes.ts` defines `DecisionOutput`, `DecisionAudit`, events, metrics, and lifecycle types. |

## 8. Authority Communication Rules

### 8.1 Allowed Communication

| Communication | Rule |
| --- | --- |
| UI/API -> Orchestrator | Required for any workflow involving more than one authority or any constitutional intelligence lifecycle. |
| Orchestrator -> domain authority | Allowed only through public authority facade interfaces. |
| Domain authority -> internal engines | Allowed within that authority boundary using files assigned in `Wave3_3_AuthorityInventory.md`. |
| Orchestrator -> DecisionAuthority | Allowed when the request requires final decision, arbitration, selection, reconsideration, or appeal behavior. |
| Orchestrator or authorities -> ConfidenceAuthority | Allowed when confidence, uncertainty, reliability, calibration, or source trust is required. |
| OutcomeTrackerAuthority -> learning signal | Allowed as output to orchestrator, not as direct mutation of another authority. |
| Orchestrator -> learning signal recipients | Allowed through authority signal intake methods. |
| Authority -> event bus | Allowed for lifecycle and audit events, with no direct authority-to-authority calls. |

### 8.2 Data Passing Rules

| Data | Passing rule |
| --- | --- |
| `StudentLifeProfile` | Passed from `StudentUnderstandingAuthority` to orchestrator, then by snapshot reference or immutable value to `OptionGeneratorAuthority`. |
| Recommendations, paths, futures | Passed from `OptionGeneratorAuthority` to orchestrator, then to user/API and `OutcomeTrackerAuthority` for tracking registration. |
| Outcome records and learning signals | Passed from `OutcomeTrackerAuthority` to orchestrator, then distributed to relevant authorities as signals. |
| Confidence values | Created or calibrated by `ConfidenceAuthority`; other authorities reference lineage rather than inventing independent confidence systems. |
| Decision outputs | Created by `DecisionAuthority`; orchestrator may include them in response synthesis. |

### 8.3 Consistency Rules

- Authority outputs must be immutable once persisted for audit.
- Corrections produce new snapshot versions, not in-place rewriting.
- Every authority call must include `flowId`, `traceId`, `requestId`, `studentId`, authority version, and policy version.
- Every multi-authority response must list which authorities participated.
- Every learning signal must include target authority, source outcome, confidence, sample size or evidence strength when available, and idempotency key.

## 9. Forbidden Authority Interactions

The orchestrator must prevent these patterns.

| Forbidden interaction | Reason |
| --- | --- |
| UI/API calls `StudentUnderstandingAuthority` and `OptionGeneratorAuthority` separately, then locally combines outputs | Cross-authority synthesis belongs to `IntelligenceOrchestrator`. |
| `OptionGeneratorAuthority` imports or calls student-model engines directly | Understanding data must arrive as orchestrated snapshots from `StudentUnderstandingAuthority`. Wave 3.3 found four current direct Option -> Student imports. |
| `OutcomeTrackerAuthority` mutates student profiles or recommendation weights directly | Learning flows back as signals through orchestrator. |
| `StudentUnderstandingAuthority` creates career recommendations or paths | Option generation belongs to `OptionGeneratorAuthority`. |
| `OptionGeneratorAuthority` creates student beliefs, archetypes, or assessment interpretation | Student knowledge belongs to `StudentUnderstandingAuthority`. |
| Any authority performs final selection or arbitration outside `DecisionAuthority` when final decision behavior is present | Decision operations are owned by `DecisionAuthority`. |
| Any system calculates confidence, uncertainty, reliability, or source trust outside `ConfidenceAuthority` where confidence authority owns the behavior | Confidence generation is constitutionally centralized. |
| Local orchestration hotspots coordinate multiple authority domains | Cross-authority coordination belongs to `IntelligenceOrchestrator`. |
| Learning signals are sent point-to-point between authorities | Learning distribution belongs to `IntelligenceOrchestrator`. |
| Events carry large sensitive payloads without durable payload reference, privacy context, and hash | Violates auditability and privacy requirements at scale. |

## 10. Event Architecture

### 10.1 Event Design Principles

The existing repository already has event patterns in `DecisionEvents.ts` and `outcome-event-engine.ts`. The orchestrator event architecture should generalize these patterns for cross-authority flows.

Core principles:

- Events are append-only.
- Events are idempotent.
- Events are partitionable by `studentId` and `flowId`.
- Events carry trace metadata.
- Events do not replace authority method contracts for synchronous calls.
- Events are used for lifecycle, audit, async learning, recovery, and observability.
- Events should carry payload references and hashes for sensitive or large data.

### 10.2 Event Categories

| Category | Examples | Purpose |
| --- | --- | --- |
| Orchestration lifecycle | `flow-received`, `flow-classified`, `authority-call-started`, `authority-call-completed`, `flow-completed`, `flow-failed` | Trace request lifecycle. |
| Constitutional policy | `policy-allowed`, `policy-denied`, `shadow-call-detected`, `forbidden-interaction-detected` | Enforce ownership rules. |
| Authority outputs | `understanding-created`, `options-generated`, `outcome-recorded`, `learning-signal-generated` | Mark immutable snapshots and outputs. |
| Decision support | `decision-requested`, `decision-completed`, `decision-appealed` | Integrate `DecisionAuthority` events. |
| Confidence support | `confidence-requested`, `confidence-calculated`, `calibration-updated` | Integrate `ConfidenceAuthority` events. |
| Async learning | `learning-signal-routed`, `learning-signal-applied`, `learning-signal-rejected`, `calibration-distributed` | Close the UNDERSTAND -> GENERATE -> LEARN loop. |
| Operations | `retry-scheduled`, `dead-lettered`, `timeout`, `degraded-authority`, `backpressure-applied` | Operate reliably at production scale. |

### 10.3 Canonical Event Envelope

| Field | Purpose |
| --- | --- |
| `eventId` | Unique event identifier for deduplication. |
| `eventType` | Event name. |
| `schemaVersion` | Event contract version. |
| `flowId` | Orchestration run. |
| `requestId` | Original request. |
| `studentId` | Partition key and subject. |
| `authority` | Emitting or affected authority. |
| `correlationId` | Trace relationship across services. |
| `causationId` | Parent event or command. |
| `timestamp` | Event creation time. |
| `payloadRef` | Durable payload location when needed. |
| `payloadHash` | Audit and reproducibility hash. |
| `policyVersion` | Constitutional policy version. |
| `authorityVersion` | Source authority version. |
| `privacyClass` | Sensitivity and retention classification. |
| `idempotencyKey` | Safe replay key. |

### 10.4 Event Delivery Architecture

For 10M+ students and horizontal scaling:

- Orchestrator instances should be stateless event producers and consumers.
- Synchronous request lifecycle events can be written through an outbox pattern in the orchestration state store.
- Async learning events should be delivered through a durable queue or stream.
- Partitioning key should be `studentId` for per-student order where needed, and `flowId` for orchestration replay.
- At-least-once delivery is acceptable only with idempotent handlers.
- Failed events move to a dead-letter queue with policy and audit context.
- High-volume events such as outcome signals can be batched, following the precedent of `BatchedEventEmitter` in `outcome-event-engine.ts`.

## 11. State Management Architecture

### 11.1 State Ownership

The orchestrator owns orchestration state only. It does not own domain state.

| State | Owner |
| --- | --- |
| Orchestration run state | `IntelligenceOrchestrator` |
| Student understanding snapshots | `StudentUnderstandingAuthority` |
| Option generation snapshots | `OptionGeneratorAuthority` |
| Outcome records and learning signals | `OutcomeTrackerAuthority` |
| Decision history and audit | `DecisionAuthority` |
| Confidence history and calibration | `ConfidenceAuthority` |
| User, assessment, profile, career, mentor memory persistence | Existing application data layer, currently represented in `prisma/schema.prisma` |

### 11.2 Orchestrator State Stores

| Store | Purpose |
| --- | --- |
| OrchestrationRunStore | Durable lifecycle state for each `flowId`. |
| IdempotencyStore | Deduplicates incoming requests and event handlers. |
| AuthoritySnapshotIndex | Maps `flowId` to authority snapshot references and hashes. |
| AuditLedger | Immutable policy, input, output, event, and version audit records. |
| EventOutbox | Reliable event publication from transactionally committed state. |
| EventInbox | Deduplication and replay tracking for consumed events. |
| LearningSignalRoutingStore | Tracks learning signals, target authority, delivery state, retries, and rejection reasons. |
| PolicyStore | Active constitutional ruleset, allowed authority edges, feature flags, and enforcement mode. |
| DeadLetterStore | Failed events, retry exhaustion, policy violations, and manual review references. |

### 11.3 Snapshot Architecture

Each authority output should be persisted as an immutable snapshot.

| Snapshot | Contents |
| --- | --- |
| UnderstandingSnapshot | `StudentLifeProfile`, archetype profile, belief/value/constraint summaries, confidence references, source assessment/session refs. |
| OptionGenerationSnapshot | Recommendations, rankings, paths, futures, market/reality/regret/optionality summaries, option explanations, confidence references. |
| OutcomeTrackingSnapshot | Baseline, recommendation exposure, decision/action/outcome events, learning signals, calibration and quality reports. |
| DecisionSnapshot | Decision output, ranking, comparisons, arbitration, selection, explanation, audit ref. |
| ConfidenceSnapshot | Confidence value, uncertainty profile, reliability assessment, calibration metadata, lineage ID. |

Snapshot requirements:

- Immutable by default.
- Versioned by authority and schema version.
- Stored by durable reference.
- Hashable for audit.
- Redacted or encrypted according to privacy class.
- Replayable by `flowId`, `studentId`, and timestamp.

### 11.4 Production Persistence

Current source evidence shows Prisma/Postgres availability in `prisma/schema.prisma`, with models such as `User`, `AssessmentSession`, `PsychologicalProfile`, `CareerMatch`, `MentorMemoryCore`, `DecisionHistory`, and `GrowthSnapshot`. Current intelligence source also contains in-memory and localStorage stores, especially in outcome tracking.

For production orchestration at 10M+ students, durable orchestration state should not rely on process memory. The state architecture should use:

- Postgres or equivalent durable database for orchestration runs, audit ledger, idempotency, and snapshot indexes.
- Queue or stream infrastructure for async learning and replayable event delivery.
- Distributed cache only for ephemeral acceleration, never as sole source of truth.
- Partitioning and indexing by `studentId`, `flowId`, `requestId`, `eventId`, `createdAt`, and authority.
- Data retention and redaction policies aligned with outcome privacy fields in `OutcomeTrackingConfig`.

## 12. Dependency Architecture

### 12.1 Dependency Direction

Allowed dependency direction:

```text
UI/API/workers
  -> IntelligenceOrchestrator
  -> authority facades
  -> authority-owned internal engines
  -> shared types and infrastructure
```

Async feedback direction:

```text
Outcome events
  -> IntelligenceOrchestrator event consumer
  -> OutcomeTrackerAuthority
  -> learning signals
  -> IntelligenceOrchestrator learning router
  -> target authority facade
```

### 12.2 Authority Registry

The orchestrator should resolve authorities through an authority registry. This avoids direct imports of concrete implementation files across authority boundaries.

Registry entries:

| Registry key | Resolves to |
| --- | --- |
| `student-understanding` | `StudentUnderstandingAuthority` facade |
| `option-generator` | `OptionGeneratorAuthority` facade |
| `outcome-tracker` | `OutcomeTrackerAuthority` facade |
| `decision` | Existing `DecisionAuthority` |
| `confidence` | Existing `ConfidenceAuthority` |

Registry responsibilities:

- Provide authority instances or clients.
- Expose authority capabilities and version.
- Enforce that orchestrator calls public facades only.
- Support local in-process authorities initially and remote service clients later.
- Allow horizontal scaling without changing request contracts.

### 12.3 Internal Engine Preservation

Existing engines remain preserved and assigned behind their authority owner:

| Authority | Preserved source scope |
| --- | --- |
| `StudentUnderstandingAuthority` | 50 mapped files from assessment, archetype, profile, student-model, belief, value, identity, growth, bias, and related understanding systems. |
| `OptionGeneratorAuthority` | 339 mapped files from recommendation, matching, market, path, future, regret, optionality, utility, career reality, mentor, validation, and decision-support systems. |
| `OutcomeTrackerAuthority` | 55 mapped files from outcome tracking, feedback, learning-loop, calibration, active-learning, quality, and outcome ontology systems. |

The orchestrator should never import these internal files directly. It should call only authority facades.

### 12.4 Deployment Topology

The design should support two deployment modes:

| Mode | Shape | Use |
| --- | --- | --- |
| Modular monolith mode | Orchestrator and authority facades run in the same Next.js/server runtime or worker runtime, with in-process calls. | Lowest migration risk and best fit for current repository shape. |
| Distributed authority mode | Orchestrator calls authority services over RPC or message bus, using the same contracts. | Horizontal scaling, independent capacity, and isolation for 10M+ students. |

The contracts must not depend on the deployment mode.

## 13. Constitutional Enforcement Architecture

### 13.1 Policy Engine

The orchestrator requires a constitutional policy engine.

Policy inputs:

- Request type.
- Requested operation.
- Source caller.
- Authority owner.
- Current flow state.
- Payload classification.
- Active constitutional ruleset version.
- Target authority.
- Adjacent authority involvement.

Policy outputs:

- Allow, deny, or require review.
- Required authority route.
- Required audit level.
- Required privacy and retention handling.
- Required event emissions.
- Required decision or confidence delegation.

### 13.2 Ownership Matrix

The policy engine should encode the constitutional ownership rules:

| Behavior | Owner |
| --- | --- |
| Assessment, profile interpretation, archetype inference, confidence within student understanding, student modeling | `StudentUnderstandingAuthority` |
| Recommendation, ranking, matching, career fit, pathway, roadmap, future simulation, market intelligence, optionality, regret, mentor intelligence, option decision intelligence | `OptionGeneratorAuthority` |
| Outcome tracking, feedback processing, learning loops, calibration, performance evaluation | `OutcomeTrackerAuthority` |
| Cross-authority routing, workflow management, synthesis, conflict coordination, learning distribution | `IntelligenceOrchestrator` |
| Final decisions, arbitration, selection, reconsideration, appeals | `DecisionAuthority` |
| Confidence, uncertainty, reliability, confidence calibration | `ConfidenceAuthority` |

### 13.3 Runtime Enforcement Points

| Enforcement point | Behavior |
| --- | --- |
| Request intake | Reject or reroute requests that attempt direct multi-authority behavior. |
| Flow planner | Ensure every step has exactly one owning authority. |
| Authority registry | Prevent concrete internal engine calls from orchestrator. |
| Event router | Prevent point-to-point learning distribution. |
| Synthesis layer | Prevent creation of new recommendation, profile, or learning logic during response composition. |
| Audit ledger | Record every allow, deny, reroute, and policy version. |
| Observability | Emit constitutional violation metrics and alerts. |

## 14. Observability Architecture

### 14.1 Trace Model

Every orchestrated flow should emit a distributed trace:

```text
flowId
  span: request-intake
  span: constitutional-classification
  span: context-load
  span: student-understanding
  span: option-generation
  span: decision-support, optional
  span: confidence-support, optional
  span: outcome-registration
  span: response-synthesis
  span: audit-finalization
```

### 14.2 Required Metrics

| Metric group | Examples |
| --- | --- |
| Throughput | flows per minute, authority calls per minute, async events per minute |
| Latency | p50/p95/p99 by request type, authority, and flow stage |
| Errors | failure rate, retry rate, timeout rate, dead-letter rate |
| Constitutional enforcement | policy denials, shadow call attempts, forbidden edge attempts, direct cross-authority call detections |
| Authority health | availability, degradation, circuit breaker state, queue depth |
| Data quality | profile completeness, recommendation confidence, outcome data quality, learning signal confidence |
| Scale | active students, active flows, event lag, partition hot spots |
| Audit | audit write failures, missing hashes, incomplete traces |

### 14.3 Logging Rules

- Logs should include `flowId`, `requestId`, `traceId`, authority, event type, and policy decision.
- Logs should not include raw sensitive student payloads by default.
- Payload hashes and durable references should be logged instead of raw payloads.
- Policy denials and retries should be structured events, not only text logs.
- Every user-visible recommendation response should be traceable to authority output snapshots.

## 15. Auditability Architecture

Auditability is a constitutional requirement, not just an operational feature.

### 15.1 Audit Record

Every orchestration run should produce an audit record containing:

- `flowId`
- `requestId`
- `studentId`
- request type
- policy version
- authority route
- authority versions
- input payload hash
- output payload hash
- authority snapshot references
- event IDs
- timing per stage
- retry and failure state
- confidence lineage IDs
- decision audit IDs when `DecisionAuthority` participates
- learning signal IDs when `OutcomeTrackerAuthority` participates
- final status

### 15.2 Reproducibility

For reproducibility:

- Store normalized inputs or references.
- Store authority and configuration versions.
- Store payload hashes.
- Store sorted authority outputs when order matters.
- Store policy decisions.
- Store model, scoring, or ruleset versions when authorities provide them.
- Keep a replay path that can reconstruct the flow from audit and snapshot references.

## 16. Horizontal Scaling Design

### 16.1 Stateless Orchestrator Instances

The orchestrator should be safe to run across many instances:

- No request-critical state only in process memory.
- Durable flow state before external authority calls.
- Idempotent retries for every authority step.
- Queue consumers can rebalance by partition.
- Authority registry can point to local instances or remote services.
- Circuit breakers protect degraded authorities.

### 16.2 Partitioning Strategy

| Data or workload | Partition key |
| --- | --- |
| Per-student flow sequence | `studentId` |
| Orchestration replay | `flowId` |
| Event deduplication | `eventId` |
| Request deduplication | `requestId` |
| Learning signal routing | `targetAuthority` plus `studentId` |
| Analytics aggregation | time bucket plus segment |

### 16.3 Scale Controls

- Batch high-volume outcome and learning events.
- Use backpressure when authority queues exceed thresholds.
- Enforce per-student and per-session concurrency limits.
- Use deadlines and cancellation propagation.
- Cache read-only career universe and market/reference data separately from student-specific data.
- Store large artifacts by reference.
- Keep hot per-student state small and snapshot-based.

## 17. Production-Grade Orchestration Blueprint

### 17.1 Component Blueprint

| Component | Responsibility |
| --- | --- |
| `IntelligenceOrchestrator` | Public meta-authority facade and primary entry point. |
| `IIntelligenceOrchestrator` | Stable public contract mirroring the authority pattern used by `IDecisionAuthority`. |
| `OrchestrationPolicyEngine` | Constitutional classification and allow/deny/reroute decisions. |
| `FlowPlanner` | Converts request type into authority steps. |
| `AuthorityRegistry` | Resolves domain and adjacent authorities through public facades. |
| `OrchestrationStateStore` | Persists flow lifecycle state and idempotency. |
| `ConstitutionalEventBus` | Publishes and consumes lifecycle, audit, policy, and learning events. |
| `AuditLedger` | Immutable trace and reproducibility record. |
| `SnapshotIndex` | References immutable authority outputs. |
| `LearningSignalRouter` | Routes outcome learning signals to owning authorities. |
| `ConflictCoordinator` | Detects output conflicts and routes decision behavior to `DecisionAuthority`. |
| `ResponseSynthesizer` | Composes authority-owned outputs without generating new intelligence. |
| `OrchestrationMetrics` | Metrics, health, tracing, and alert integration. |

### 17.2 First-Class Workflows

| Workflow | Orchestrator path |
| --- | --- |
| User registration | Create user context, no intelligence unless onboarding begins. |
| User onboarding | Route onboarding signals to `StudentUnderstandingAuthority`; store understanding snapshot. |
| Assessment | Route questions and responses to `StudentUnderstandingAuthority`; output `StudentLifeProfile`. |
| Profile creation | Use understanding snapshot as the canonical profile output. |
| Career discovery | Use `StudentLifeProfile` to call `OptionGeneratorAuthority`. |
| Recommendation | Generate recommendation set and option explanations through `OptionGeneratorAuthority`. |
| Roadmap creation | Generate pathways and next steps through `OptionGeneratorAuthority`. |
| Future simulation | Generate future scenarios through `OptionGeneratorAuthority`. |
| Decision support | Route final selection/arbitration/decision-readiness to `DecisionAuthority`. |
| Learning feedback | Route events to `OutcomeTrackerAuthority`; distribute learning signals through orchestrator. |
| Outcome tracking | Register recommendation, decision, action, and outcome events through `OutcomeTrackerAuthority`. |

### 17.3 Failure Handling

| Failure | Response |
| --- | --- |
| Policy violation | Reject, emit policy event, write audit record. |
| Missing understanding snapshot | Run or request UNDERSTAND before GENERATE. |
| Option generation timeout | Mark generation failed retryable if idempotent, otherwise return degraded response with audit ref. |
| Outcome tracking unavailable | Return primary response and queue tracking registration for async retry. |
| DecisionAuthority unavailable | Return generated options without final selection, mark decision support deferred. |
| ConfidenceAuthority unavailable | Use authority-defined fallback only if provided by `ConfidenceAuthority`; do not create local fallback in orchestrator. |
| Event publish failure | Persist outbox entry and retry. |
| Learning signal delivery failure | Retry through learning signal routing store, then dead-letter with audit context. |

### 17.4 Constitutional Invariants

The orchestrator design must preserve these invariants:

1. Every intelligence behavior has exactly one owner.
2. Multi-authority workflows flow through `IntelligenceOrchestrator`.
3. `StudentLifeProfile` is produced by `StudentUnderstandingAuthority`.
4. Recommendations, paths, futures, and option explanations are produced by `OptionGeneratorAuthority`.
5. Outcome records, learning signals, and calibration reports are produced by `OutcomeTrackerAuthority`.
6. Final selection and arbitration use `DecisionAuthority`.
7. Confidence and uncertainty use `ConfidenceAuthority`.
8. Learning flows back as signals, not direct dependencies.
9. Existing engines remain preserved behind authority facades.
10. Every orchestrated flow is observable, auditable, replayable, and policy-checked.

## 18. Final Design Verdict

The missing `IntelligenceOrchestrator` should be designed as a stateless, horizontally scalable meta-authority with durable state, event, audit, and policy infrastructure around it.

It should not replace CareerOS intelligence engines. It should make the current intelligence surface constitutionally navigable by routing:

```text
raw student input
  -> StudentUnderstandingAuthority
  -> StudentLifeProfile
  -> OptionGeneratorAuthority
  -> recommendations, pathways, futures, explanations
  -> OutcomeTrackerAuthority
  -> outcome records and learning signals
  -> IntelligenceOrchestrator
  -> authority-specific learning updates
```

The production blueprint is therefore a coordination layer, an enforcement layer, an audit layer, and a lifecycle layer. It is not a fourth domain intelligence engine.

