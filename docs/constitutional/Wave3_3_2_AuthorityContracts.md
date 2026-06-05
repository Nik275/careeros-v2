# Wave 3.3.2 - Authority API Contract Design

**Date:** 2026-06-05  
**Repository:** `C:/Users/a/Projects/careeros-v2`  
**Status:** Architecture and contract design only. No production code changes. No stubs.  
**Constitutional source:** `docs/constitutional/CAREEROS_CONSTITUTION.md`

## 1. Source Basis

This contract design follows:

- `docs/constitutional/CAREEROS_CONSTITUTION.md`
- `docs/constitutional/Wave3_3_1_IntelligenceOrchestratorBlueprint.md`
- `docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md`
- `docs/constitutional/Wave3_3_AuthorityInventory.md`
- `docs/constitutional/Wave3_3_OwnershipViolations.md`
- `docs/constitutional/Wave3_3_FinalVerdict.md`

Source type anchors already present in the repository:

| Source file | Contract anchor |
| --- | --- |
| `src/types/student-life-profile.ts` | `StudentLifeProfile` as the central student understanding output. |
| `src/assessment/assessment-types.ts` | Assessment questions, responses, signals, dimension scores, and assessment confidence. |
| `src/recommendation/recommendation-types.ts` | `CareerRecommendation`, `RecommendationSet`, `CareerOption`, recommendation confidence, explanations, and analytics. |
| `src/intelligence/outcome-tracking/outcome-types.ts` | `OutcomeEvent`, `LearningSignal`, `StudentOutcomeRecord`, outcome quality, growth, prediction, and analytics types. |
| `src/intelligence/decision/IDecisionAuthority.ts` | Authority interface precedent: stable public surface, events, metrics, health, auditability. |
| `src/intelligence/confidence/IConfidenceAuthority.ts` | Confidence authority precedent: confidence, uncertainty, reliability, calibration, source trust. |

## 2. Contract Design Principles

These contracts are logical API contracts, not implementation stubs.

1. `IntelligenceOrchestrator` is the only cross-authority caller.
2. Every domain behavior has exactly one owner.
3. All authority-to-authority communication is forbidden unless mediated by the orchestrator.
4. Authorities expose commands, queries, events, health, metrics, and version metadata through stable contracts.
5. Authority outputs are immutable snapshots or snapshot references.
6. Large or sensitive payloads travel by durable reference plus hash.
7. Contracts are deployment-neutral: they must work in a modular monolith or remote service topology.
8. Contracts are idempotent and event-friendly for 10M+ students.
9. Contracts carry enough metadata for audit, replay, observability, and constitutional enforcement.
10. Existing intelligence modules remain preserved behind authority facades.

## 3. Shared Contract Primitives

All authority APIs should share these primitive envelope fields.

| Field | Required | Purpose |
| --- | --- | --- |
| `contractVersion` | Yes | Semantic version of the request or event schema. |
| `requestId` | Yes for commands and queries | Idempotency key for request deduplication. |
| `flowId` | Yes | Orchestration flow identifier. |
| `traceId` | Yes | Distributed trace identifier propagated through authority calls. |
| `studentId` | Yes when student-scoped | Student partition key and audit subject. |
| `sessionId` | Optional | Assessment, UI, or workflow session scope. |
| `source` | Yes | Caller type, always expected to be `IntelligenceOrchestrator` for authority commands. |
| `authority` | Yes in responses and events | Authority that owns the emitted result. |
| `timestamp` | Yes | Contract creation time. |
| `idempotencyKey` | Yes for commands and events | Safe retry and replay key. |
| `payloadRef` | Required for large or sensitive payloads | Durable data reference. |
| `payloadHash` | Yes when payload or payloadRef exists | Audit and reproducibility hash. |
| `privacyClass` | Yes for student data | Data sensitivity and retention class. |
| `policyVersion` | Yes | Constitutional ruleset version used for authorization. |
| `authorityVersion` | Yes in responses and events | Authority implementation or facade version. |

### 3.1 Contract Status Values

| Status | Meaning |
| --- | --- |
| `accepted` | Command accepted for synchronous or async processing. |
| `completed` | Command or query completed successfully. |
| `queued` | Work accepted for async execution. |
| `partial` | Some requested outputs are available; missing items are listed in warnings. |
| `rejected` | Request failed constitutional or input validation. |
| `failed_retryable` | Retry is safe with the same idempotency key. |
| `failed_final` | Request cannot be completed without a new command. |

### 3.2 Standard Error Shape

| Field | Purpose |
| --- | --- |
| `errorCode` | Stable machine-readable code. |
| `message` | Human-readable operational message. |
| `authority` | Authority that rejected or failed. |
| `retryable` | Whether the same idempotency key can be retried. |
| `policyViolation` | Whether the error is constitutional. |
| `auditRef` | Audit record reference. |

## 4. Authority Interface Definitions

### 4.1 IntelligenceOrchestrator

| Contract area | Definition |
| --- | --- |
| Inputs | `RequestEnvelope`, authority outputs, learning signals, feedback events, async event envelopes. |
| Outputs | Orchestration result, authority route, lifecycle state, audit records, event dispatch records, synthesized response references. |
| Commands | `RouteAuthorityCommand`, `RunFullIntelligenceFlowCommand`, `DispatchAuthorityCommand`, `ApplyLearningSignalCommand`, `RegisterOutcomeTrackingCommand`, `ReplayFlowCommand`. |
| Queries | `GetFlowStatusQuery`, `GetAuditTrailQuery`, `GetAuthorityRouteQuery`, `GetSnapshotLineageQuery`, `GetContractHealthQuery`. |
| Events | `flow.received`, `flow.classified`, `authority.call.started`, `authority.call.completed`, `authority.call.failed`, `flow.completed`, `flow.failed`, `policy.denied`, `event.dispatched`. |
| Ownership boundary | Owns cross-authority routing, lifecycle state, event dispatch, audit trail, constitutional validation, response synthesis. Does not create student understanding, options, or outcome learning. |

### 4.2 StudentUnderstandingAuthority

| Contract area | Definition |
| --- | --- |
| Inputs | `StudentProfileInput`, `AssessmentInput`, `ArchetypeInput`, behavior signals, learning signals routed by orchestrator. |
| Outputs | `StudentModelOutput`, `StudentLifeProfile`, archetype profile, assessment signals, dimension scores, `ConfidenceOutput`, understanding explanations. |
| Commands | `BuildStudentUnderstandingCommand`, `UpdateStudentUnderstandingCommand`, `ApplyUnderstandingLearningSignalCommand`, `ExplainUnderstandingCommand`. |
| Queries | `GetStudentModelQuery`, `GetUnderstandingSnapshotQuery`, `GetArchetypeProfileQuery`, `GetUnderstandingConfidenceQuery`, `GetUnderstandingLineageQuery`. |
| Events | `student.input.received`, `assessment.processed`, `archetype.inferred`, `student.model.created`, `student.model.updated`, `understanding.confidence.updated`, `understanding.explained`. |
| Ownership boundary | Sole owner of student knowledge creation: assessment interpretation, profile synthesis, archetype inference, student beliefs, values, constraints, risk, bias, and understanding confidence. |

### 4.3 OptionGeneratorAuthority

| Contract area | Definition |
| --- | --- |
| Inputs | `RecommendationRequest`, `PathwayRequest`, `FutureSimulationRequest`, immutable `StudentModelOutput` or `StudentLifeProfile` snapshot references, career universe references, market references, learning signals routed by orchestrator. |
| Outputs | `RankedOptionsOutput`, recommendation sets, pathway sets, future scenarios, option explanations, market-aware option analysis, regret, optionality, utility, and career reality outputs. |
| Commands | `GenerateRecommendationsCommand`, `GeneratePathwaysCommand`, `RunFutureSimulationCommand`, `ExplainOptionCommand`, `ApplyGenerationLearningSignalCommand`, `RegisterOptionCatalogCommand`. |
| Queries | `GetRecommendationSetQuery`, `GetPathwaySetQuery`, `GetFutureSimulationQuery`, `GetOptionExplanationQuery`, `GetOptionLineageQuery`, `GetGenerationMetricsQuery`. |
| Events | `recommendation.requested`, `recommendation.generated`, `options.ranked`, `pathway.generated`, `future.simulated`, `option.explained`, `generation.learning.applied`. |
| Ownership boundary | Sole owner of option generation, ranking, matching, career fit, pathways, roadmaps, future simulation, market-aware guidance, option explanation, optionality, regret, utility, and career reality. |

### 4.4 OutcomeTrackerAuthority

| Contract area | Definition |
| --- | --- |
| Inputs | `OutcomeSubmission`, `OutcomeObservation`, recommendation exposure events, decision events, action events, feedback, quality evidence. |
| Outputs | Outcome records, timeline entries, `LearningSignal`, `QualityMetrics`, calibration reports, cohort insights, feedback analysis, growth indicators. |
| Commands | `RegisterRecommendationExposureCommand`, `RecordDecisionCommand`, `RecordActionCommand`, `SubmitOutcomeCommand`, `ProcessFeedbackCommand`, `GenerateLearningSignalsCommand`, `GenerateQualityMetricsCommand`. |
| Queries | `GetOutcomeRecordQuery`, `GetStudentOutcomeTimelineQuery`, `GetLearningSignalsQuery`, `GetQualityMetricsQuery`, `GetCalibrationReportQuery`, `GetOutcomeLineageQuery`. |
| Events | `outcome.submitted`, `outcome.observed`, `feedback.received`, `quality.measured`, `learning.signal.generated`, `calibration.report.generated`, `outcome.timeline.updated`. |
| Ownership boundary | Sole owner of tracking what happened, processing feedback, learning from outcomes, generating calibration, quality, cohort, performance, and learning signals. |

## 5. StudentUnderstandingAuthority Contract

### 5.1 StudentProfileInput

Purpose: capture raw or semi-structured student information before it becomes constitutional student understanding.

| Field | Required | Meaning |
| --- | --- | --- |
| `inputId` | Yes | Unique student profile input record. |
| `studentId` | Yes | Student identifier. |
| `profileSource` | Yes | `onboarding`, `assessment`, `student_edit`, `behavior`, `mentor_session`, `learning_signal`, or `import`. |
| `demographicsRef` | Optional | Durable reference for sensitive demographic data. |
| `educationContext` | Optional | Grade, level, institution, stream, exam context, or constraints. |
| `goals` | Optional | Expressed goals or aspirations. |
| `constraints` | Optional | Financial, geographic, family, educational, time, or access constraints. |
| `values` | Optional | Student-stated values and life priorities. |
| `motivationSignals` | Optional | Signals related to mastery, achievement, autonomy, impact, security, recognition. |
| `behaviorSignals` | Optional | Behavioral evidence routed by orchestrator. |
| `sourceEvidence` | Yes | Evidence references, timestamps, confidence, and collection method. |
| `consentContext` | Yes | Consent for storage, inference, learning, and feedback usage. |

Validation requirements:

- Must not include generated career recommendations.
- Must not include option ranking or pathway decisions.
- Must carry `studentId`, `flowId`, `traceId`, `requestId`, and policy version in the enclosing request.

### 5.2 AssessmentInput

Purpose: transform assessment questions and responses into student-understanding signals.

| Field | Required | Meaning |
| --- | --- | --- |
| `assessmentId` | Yes | Assessment definition identifier. |
| `assessmentVersion` | Yes | Version of assessment content. |
| `sessionId` | Yes | Assessment session identifier. |
| `studentId` | Yes | Student identifier. |
| `questions` | Yes or `questionsRef` | Presented assessment questions. Existing source anchor: `AssessmentQuestion`. |
| `responses` | Yes or `responsesRef` | Student responses. Existing source anchor: `AssessmentResponse`. |
| `responseTimings` | Optional | Response time and pacing metadata. |
| `completionState` | Yes | `in_progress`, `completed`, `abandoned`, or `partial`. |
| `qualitySignals` | Optional | Inconsistency, straight-lining, speeding, fatigue, or reliability signals. |
| `payloadHash` | Yes | Hash of normalized question/response payload. |

Outputs expected:

- Assessment signals.
- Dimension scores.
- Assessment quality and reliability.
- Understanding confidence.
- Updated student model snapshot.

### 5.3 ArchetypeInput

Purpose: infer or update archetype understanding from student data.

| Field | Required | Meaning |
| --- | --- | --- |
| `archetypeInputId` | Yes | Unique input identifier. |
| `studentId` | Yes | Student identifier. |
| `sourceSnapshotRef` | Yes | Student profile, assessment, or belief snapshot reference. |
| `signalCollections` | Optional | Archetype signal collections or evidence references. |
| `explicitPreferences` | Optional | Student-stated preferred or rejected archetypes. |
| `textEvidenceRef` | Optional | Durable reference to free-text inputs. |
| `confidencePolicy` | Optional | Required confidence behavior or threshold. |
| `explanationLevel` | Optional | `minimal`, `standard`, `detailed`, or `technical`. |

Forbidden contents:

- Career recommendations.
- Market analysis.
- Future scenarios.
- Outcome learning decisions.

### 5.4 StudentModelOutput

Purpose: canonical output of StudentUnderstandingAuthority.

| Field | Required | Meaning |
| --- | --- | --- |
| `studentModelId` | Yes | Immutable student model snapshot ID. |
| `studentId` | Yes | Student identifier. |
| `snapshotVersion` | Yes | Monotonic version for the student model. |
| `studentLifeProfile` | Yes | Existing source anchor: `StudentLifeProfile`. |
| `archetypeProfile` | Optional | Archetype inference output and evidence. |
| `beliefProfile` | Optional | Student beliefs, contradictions, and evidence. |
| `valuesProfile` | Optional | Values and value evolution summary. |
| `identityProfile` | Optional | Identity development summary. |
| `riskProfile` | Optional | Risk tolerance, bias, uncertainty, or vulnerability understanding. |
| `constraintsProfile` | Optional | Practical constraints and evidence. |
| `dimensionScores` | Optional | Existing source anchor: `DimensionScoreMap`. |
| `confidence` | Yes | `ConfidenceOutput` owned or delegated through constitutional confidence behavior. |
| `lineage` | Yes | Source input refs, engine refs, hashes, and authority version. |
| `createdAt` | Yes | Snapshot creation timestamp. |

Immutability rule:

- Student models are append-only snapshots. Updates create a new `snapshotVersion`.

### 5.5 ConfidenceOutput

Purpose: express confidence in student understanding without creating a separate shadow confidence system.

| Field | Required | Meaning |
| --- | --- | --- |
| `confidenceId` | Yes | Confidence lineage or authority reference. |
| `overall` | Yes | Normalized confidence score. |
| `byDimension` | Optional | Confidence by profile dimension. |
| `dataCompleteness` | Optional | Completeness and coverage score. |
| `evidenceStrength` | Optional | Evidence quality and source count. |
| `contradictionLevel` | Optional | Degree of conflicting signals. |
| `calibrationRef` | Optional | Reference to constitutional calibration record where available. |
| `authority` | Yes | Confidence owning authority or delegated authority. |
| `explanationRef` | Optional | Reference to confidence explanation. |

Rule:

- StudentUnderstandingAuthority may expose understanding confidence, but confidence calculation must comply with the constitutional `ConfidenceAuthority` boundary when confidence authority behavior is in scope.

### 5.6 UnderstandingEvents

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| `student.profile.input.accepted` | StudentUnderstandingAuthority | Input accepted and validated. |
| `assessment.input.processed` | StudentUnderstandingAuthority | Signals and dimension scores were produced. |
| `archetype.input.processed` | StudentUnderstandingAuthority | Archetype evidence and scores were produced. |
| `student.model.created` | StudentUnderstandingAuthority | New immutable model snapshot created. |
| `student.model.updated` | StudentUnderstandingAuthority | New snapshot version created from new evidence. |
| `understanding.confidence.updated` | StudentUnderstandingAuthority | Confidence output changed. |
| `understanding.learning.applied` | StudentUnderstandingAuthority | Learning signal from orchestrator was applied. |
| `understanding.explanation.generated` | StudentUnderstandingAuthority | Explanation for student-understanding output created. |

## 6. OptionGeneratorAuthority Contract

### 6.1 RecommendationRequest

Purpose: generate career and life options from immutable student understanding.

| Field | Required | Meaning |
| --- | --- | --- |
| `recommendationRequestId` | Yes | Unique recommendation command ID. |
| `studentId` | Yes | Student identifier. |
| `studentModelRef` | Yes | Immutable `StudentModelOutput` or `StudentLifeProfile` snapshot reference. |
| `careerUniverseRef` | Yes | Career catalog, ontology, taxonomy, or market universe reference. |
| `constraints` | Optional | Practical constraints that must shape recommendation eligibility. |
| `generationGoal` | Yes | `career_discovery`, `shortlist`, `backup_options`, `stretch_options`, `roadmap_seed`, or `decision_support`. |
| `rankingPolicy` | Optional | Ranking weights and ranking objective. |
| `marketContextRef` | Optional | Market, demand, salary, resilience, automation, or regional signal reference. |
| `learningContextRef` | Optional | Learning or calibration signals routed by orchestrator. |
| `explanationLevel` | Optional | Requested explanation depth. |
| `maxOptions` | Optional | Upper bound for returned ranked options. |

Validation requirements:

- Must include a student understanding snapshot or reference.
- Must not call StudentUnderstandingAuthority directly to obtain missing student data.
- Must not record outcomes directly.

### 6.2 PathwayRequest

Purpose: generate career paths, roadmaps, milestones, alternatives, and transition plans.

| Field | Required | Meaning |
| --- | --- | --- |
| `pathwayRequestId` | Yes | Unique pathway command ID. |
| `studentId` | Yes | Student identifier. |
| `studentModelRef` | Yes | Immutable understanding snapshot reference. |
| `targetOptionIds` | Optional | Career or option IDs to build paths for. |
| `startingPoint` | Yes | Current education, skill, location, and constraint state. |
| `timeHorizon` | Yes | Short, medium, long, or explicit date range. |
| `pathwayDepth` | Optional | Number of alternatives or branches. |
| `constraints` | Optional | Cost, geography, family, time, prerequisite, and risk constraints. |
| `marketContextRef` | Optional | Market and career reality signals. |
| `learningContextRef` | Optional | Prior calibration and outcome learning signals. |

Outputs expected:

- Pathway set.
- Milestones.
- Dependencies and prerequisites.
- Switching points.
- Alternative paths.
- Risk, optionality, regret, and reality annotations.

### 6.3 FutureSimulationRequest

Purpose: generate future scenarios and long-term outcome projections.

| Field | Required | Meaning |
| --- | --- | --- |
| `simulationRequestId` | Yes | Unique future simulation command ID. |
| `studentId` | Yes | Student identifier. |
| `studentModelRef` | Yes | Understanding snapshot reference. |
| `optionRefs` | Yes | Option or pathway references to simulate. |
| `timeHorizons` | Yes | Requested simulation horizons. |
| `scenarioPolicy` | Yes | Baseline, optimistic, pessimistic, alternative, or stress-test scenario policy. |
| `marketContextRef` | Optional | Demand, salary, automation, regional, or industry trend references. |
| `lifeOutcomeWeights` | Optional | Long-term fulfillment weights, not local-only optimization. |
| `confidencePolicy` | Optional | Required confidence handling. |

Outputs expected:

- Future scenarios.
- Projected satisfaction, fulfillment, optionality, risk, regret, and constraints.
- Scenario explanations.
- Confidence and uncertainty references.

### 6.4 RankedOptionsOutput

| Field | Required | Meaning |
| --- | --- | --- |
| `rankedOptionsId` | Yes | Immutable ranked output snapshot ID. |
| `studentId` | Yes | Student identifier. |
| `studentModelRef` | Yes | Understanding snapshot used. |
| `options` | Yes | Ranked options, recommendations, or paths. |
| `rankingMethod` | Yes | Method, weights, and policy used. |
| `scores` | Yes | Overall and dimensional scores. |
| `confidence` | Yes | Confidence reference or output. |
| `explanations` | Optional | `ExplanationOutput` references. |
| `alternatives` | Optional | Alternative, backup, and stretch options. |
| `lineage` | Yes | Engine, data, source, and payload hashes. |
| `createdAt` | Yes | Snapshot timestamp. |

### 6.5 ExplanationOutput

Rule: Option explanations are owned by OptionGeneratorAuthority when they explain generated options, recommendations, paths, futures, or option trade-offs.

| Field | Required | Meaning |
| --- | --- | --- |
| `explanationId` | Yes | Immutable explanation ID. |
| `explainsRef` | Yes | Recommendation, option, pathway, future, or ranked output ref. |
| `summary` | Yes | Concise explanation. |
| `keyFactors` | Yes | Ranked factors used in the explanation. |
| `supportingEvidence` | Optional | Evidence references. |
| `tradeoffs` | Optional | Major trade-offs, risks, or sacrifices. |
| `uncertainties` | Optional | Known unknowns and uncertainty drivers. |
| `nextActions` | Optional | Option-related next steps. |
| `confidenceRef` | Optional | Confidence lineage reference. |
| `audienceLevel` | Yes | Student, mentor, engineer, audit, or technical. |

### 6.6 OptionGenerationEvents

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| `recommendation.request.accepted` | OptionGeneratorAuthority | Recommendation command accepted. |
| `recommendations.generated` | OptionGeneratorAuthority | Recommendation set or ranked options created. |
| `options.ranked` | OptionGeneratorAuthority | Ranking completed. |
| `pathway.request.accepted` | OptionGeneratorAuthority | Pathway command accepted. |
| `pathways.generated` | OptionGeneratorAuthority | Pathway set created. |
| `future.simulation.request.accepted` | OptionGeneratorAuthority | Simulation command accepted. |
| `future.scenarios.generated` | OptionGeneratorAuthority | Future scenarios created. |
| `option.explanation.generated` | OptionGeneratorAuthority | Option-owned explanation created. |
| `generation.learning.applied` | OptionGeneratorAuthority | Orchestrator-routed learning signal applied. |

## 7. OutcomeTrackerAuthority Contract

### 7.1 OutcomeSubmission

Purpose: submit user, system, mentor, or external outcome evidence.

| Field | Required | Meaning |
| --- | --- | --- |
| `outcomeSubmissionId` | Yes | Unique submission ID. |
| `studentId` | Yes | Student identifier. |
| `relatedRecommendationRef` | Optional | Recommendation or ranked option reference. |
| `relatedDecisionRef` | Optional | Decision output reference. |
| `relatedActionRef` | Optional | Roadmap action, milestone, skill, internship, application, or exploration reference. |
| `outcomeType` | Yes | Career decision, education, skill, internship, job, exploration, psychological, growth, or custom. |
| `timepoint` | Yes | Baseline, immediate, 1 month, 3 months, 6 months, 12 months, or longer. |
| `reportedBy` | Yes | Student, system, mentor, external, or admin. |
| `payloadRef` | Yes for detailed data | Durable outcome data reference. |
| `payloadHash` | Yes | Normalized payload hash. |
| `verification` | Optional | Verification state and source. |
| `consentContext` | Yes | Outcome-learning consent and privacy constraints. |

### 7.2 OutcomeObservation

Purpose: normalized observation extracted from submitted outcome data.

| Field | Required | Meaning |
| --- | --- | --- |
| `observationId` | Yes | Unique observation ID. |
| `studentId` | Yes | Student identifier. |
| `outcomeSubmissionRef` | Yes | Source submission reference. |
| `dimension` | Yes | Satisfaction, success, growth, clarity, confidence, wellbeing, accuracy, regret, optionality, or quality dimension. |
| `observedValue` | Yes | Normalized or typed observed value. |
| `expectedValueRef` | Optional | Prediction or recommendation expectation reference. |
| `errorMagnitude` | Optional | Difference between expected and actual value. |
| `confidence` | Yes | Observation confidence. |
| `evidence` | Optional | Evidence references and quality. |
| `observedAt` | Yes | Observation timestamp. |

### 7.3 LearningSignal

Purpose: communicate learning back to other authorities through orchestrator.

This aligns with the existing source anchor `LearningSignal` in `src/intelligence/outcome-tracking/outcome-types.ts`, but the contract adds routing and constitutional metadata.

| Field | Required | Meaning |
| --- | --- | --- |
| `learningSignalId` | Yes | Unique learning signal ID. |
| `studentId` | Optional | Student-scoped signal when applicable. |
| `sourceOutcomeRef` | Yes | Outcome record, observation, comparison, or quality metric reference. |
| `signalType` | Yes | Recommendation feedback, prediction error, growth pattern, unexpected outcome, calibration update, quality warning. |
| `targetAuthority` | Yes | `StudentUnderstandingAuthority`, `OptionGeneratorAuthority`, `DecisionAuthority`, or `ConfidenceAuthority`. |
| `targetCapability` | Optional | Specific authority capability to update or calibrate. |
| `payloadRef` | Optional | Durable signal details. |
| `summary` | Yes | Compact description of what was learned. |
| `confidence` | Yes | Confidence in the learning signal. |
| `sampleSize` | Optional | Evidence volume for aggregate signals. |
| `priority` | Yes | Low, medium, high, or critical. |
| `deliveryPolicy` | Yes | Sync, async, batch, delayed, or review-required. |
| `processed` | Yes | Processing status. |

Rules:

- OutcomeTrackerAuthority generates learning signals.
- IntelligenceOrchestrator routes learning signals.
- Target authorities apply signals through explicit signal-intake commands.
- No target authority may pull raw outcome records directly from OutcomeTrackerAuthority.

### 7.4 QualityMetrics

| Field | Required | Meaning |
| --- | --- | --- |
| `qualityMetricsId` | Yes | Unique metrics snapshot ID. |
| `studentId` | Optional | Student-scoped metric when applicable. |
| `scope` | Yes | Student, recommendation, decision, cohort, model, authority, or system. |
| `timeRange` | Yes | Metrics time range. |
| `recommendationSuccessRate` | Optional | Existing outcome analytics anchor. |
| `decisionSuccessRate` | Optional | Existing outcome analytics anchor. |
| `predictionAccuracy` | Optional | Prediction-to-reality accuracy. |
| `recommendationAccuracy` | Optional | Recommendation quality over outcomes. |
| `calibrationScore` | Optional | Confidence or model calibration score. |
| `studentSatisfaction` | Optional | Satisfaction summary. |
| `growthRate` | Optional | Student growth metric. |
| `dataQuality` | Yes | Completeness, source quality, verification, and missingness. |
| `confidence` | Yes | Confidence in the metrics. |

### 7.5 FeedbackEvents

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| `feedback.received` | OutcomeTrackerAuthority | Raw feedback accepted. |
| `outcome.submission.accepted` | OutcomeTrackerAuthority | Outcome submission accepted. |
| `outcome.observation.created` | OutcomeTrackerAuthority | Normalized observation created. |
| `outcome.record.updated` | OutcomeTrackerAuthority | Outcome record changed by append-only event. |
| `quality.metrics.generated` | OutcomeTrackerAuthority | Quality metrics snapshot produced. |
| `learning.signal.generated` | OutcomeTrackerAuthority | Learning signal created for orchestrator routing. |
| `calibration.report.generated` | OutcomeTrackerAuthority | Calibration report produced. |
| `feedback.rejected` | OutcomeTrackerAuthority | Feedback failed validation, consent, or quality requirements. |

## 8. IntelligenceOrchestrator Contract

### 8.1 RequestEnvelope

Purpose: universal command/query envelope for orchestrated intelligence.

| Field | Required | Meaning |
| --- | --- | --- |
| `requestId` | Yes | Idempotency key. |
| `flowId` | Yes | Orchestration run ID. |
| `contractVersion` | Yes | Envelope schema version. |
| `studentId` | Required for student-scoped work | Student partition key. |
| `sessionId` | Optional | Workflow or assessment session. |
| `requestType` | Yes | Understand, generate, learn, full_flow, route, dispatch, replay, or query. |
| `source` | Yes | UI, API, worker, webhook, scheduler, admin, or orchestrator-internal. |
| `payload` | Optional | Inline compact payload. |
| `payloadRef` | Required for large or sensitive data | Durable payload reference. |
| `payloadHash` | Yes | Hash of normalized payload. |
| `consentContext` | Yes for student data | Consent and privacy status. |
| `policyContext` | Yes | Constitutional policy version, feature gates, authority versions. |
| `traceId` | Yes | Distributed trace ID. |
| `deadline` | Optional | Timeout or cancellation deadline. |
| `replyMode` | Yes | Synchronous, async, webhook, event-only, or poll. |

### 8.2 AuthorityRouting

Purpose: explicit routing decision produced by orchestrator policy classification.

| Field | Required | Meaning |
| --- | --- | --- |
| `routingId` | Yes | Unique route decision ID. |
| `flowId` | Yes | Orchestration flow. |
| `requestId` | Yes | Original request. |
| `routeType` | Yes | Single authority, sequential flow, async event, learning distribution, or rejected. |
| `allowedAuthorities` | Yes | Authorities allowed for this flow. |
| `authoritySteps` | Yes | Ordered list of authority commands or queries. |
| `forbiddenEdgesChecked` | Yes | List of communication edges validated. |
| `policyDecision` | Yes | Allow, deny, reroute, or require review. |
| `policyReason` | Yes | Human-readable policy rationale. |
| `policyVersion` | Yes | Constitutional ruleset version. |
| `auditRef` | Yes | Audit record reference. |

### 8.3 LifecycleTracking

| Field | Required | Meaning |
| --- | --- | --- |
| `flowId` | Yes | Orchestration run ID. |
| `status` | Yes | Received, classified, loading_context, understanding, generating, tracking, synthesizing, completed, failed, queued. |
| `currentAuthority` | Optional | Authority currently active. |
| `completedSteps` | Yes | Ordered completed authority and orchestration steps. |
| `pendingSteps` | Yes | Remaining planned steps. |
| `failedSteps` | Optional | Failed steps with retry state. |
| `startedAt` | Yes | Start timestamp. |
| `updatedAt` | Yes | Last update timestamp. |
| `deadline` | Optional | Flow deadline. |
| `snapshotRefs` | Optional | Understanding, generation, outcome, decision, confidence refs. |
| `eventRefs` | Optional | Emitted event IDs. |

### 8.4 EventDispatching

| Field | Required | Meaning |
| --- | --- | --- |
| `dispatchId` | Yes | Unique dispatch ID. |
| `eventId` | Yes | Event being dispatched. |
| `eventType` | Yes | Canonical event type. |
| `sourceAuthority` | Yes | Emitting authority or orchestrator. |
| `target` | Yes | Event bus, authority inbox, audit ledger, webhook, or dead-letter queue. |
| `deliveryMode` | Yes | Sync, async, batch, delayed, retry, dead-letter. |
| `partitionKey` | Yes | Usually `studentId` or `flowId`. |
| `idempotencyKey` | Yes | Dispatch dedupe key. |
| `attempt` | Yes | Delivery attempt count. |
| `status` | Yes | Pending, delivered, failed_retryable, failed_final. |
| `auditRef` | Yes | Dispatch audit reference. |

### 8.5 AuditTrailRecords

| Field | Required | Meaning |
| --- | --- | --- |
| `auditId` | Yes | Immutable audit record ID. |
| `flowId` | Yes | Flow being audited. |
| `requestId` | Yes | Original request. |
| `studentId` | Optional | Student subject when applicable. |
| `operation` | Yes | Command, query, event, policy decision, or synthesis. |
| `authorityRoute` | Yes | Authorities involved and order. |
| `policyVersion` | Yes | Constitutional policy version. |
| `contractVersions` | Yes | Envelope, command, output, and event versions. |
| `inputHash` | Yes | Normalized input hash. |
| `outputHash` | Optional | Normalized output hash. |
| `snapshotRefs` | Optional | Produced or consumed snapshots. |
| `eventRefs` | Optional | Related events. |
| `decision` | Yes | Allowed, denied, completed, failed, retried, or dead-lettered. |
| `reason` | Yes | Audit explanation. |
| `createdAt` | Yes | Audit timestamp. |

## 9. Communication Rules

### 9.1 Allowed Communication

Summary rule: `Orchestrator -> Any Authority` is allowed when the orchestrator policy engine authorizes the route and records the route in the audit trail.

| Edge | Allowed? | Rule |
| --- | --- | --- |
| `IntelligenceOrchestrator -> StudentUnderstandingAuthority` | Yes | For UNDERSTAND commands, queries, and learning-signal application. |
| `IntelligenceOrchestrator -> OptionGeneratorAuthority` | Yes | For GENERATE commands, queries, and generation learning updates. |
| `IntelligenceOrchestrator -> OutcomeTrackerAuthority` | Yes | For LEARN commands, queries, outcome recording, and learning signal generation. |
| `Authority -> its own internal engines` | Yes | Only within the ownership inventory assigned to that authority. |
| `Authority -> event bus` | Yes | Lifecycle events only; not direct command invocation of another authority. |
| `Authority -> IntelligenceOrchestrator` | Yes | Event emission or command response, not direct request to another authority. |

### 9.2 Forbidden Communication

| Edge | Status | Required replacement |
| --- | --- | --- |
| `StudentAuthority -> OptionAuthority` | Forbidden | `StudentAuthority -> event/response -> IntelligenceOrchestrator -> OptionAuthority` |
| `StudentAuthority -> OutcomeAuthority` | Forbidden | `StudentAuthority -> event/response -> IntelligenceOrchestrator -> OutcomeAuthority` |
| `OptionAuthority -> OutcomeAuthority` | Forbidden | `OptionAuthority -> event/response -> IntelligenceOrchestrator -> OutcomeAuthority` |
| `OutcomeAuthority -> StudentAuthority` | Forbidden | `OutcomeAuthority -> LearningSignal -> IntelligenceOrchestrator -> StudentAuthority` |
| `OutcomeAuthority -> OptionAuthority` | Forbidden | `OutcomeAuthority -> LearningSignal -> IntelligenceOrchestrator -> OptionAuthority` |
| `OptionAuthority -> StudentAuthority` | Forbidden | `OptionAuthority` consumes immutable understanding snapshots from orchestrator. |
| `UI/API -> multiple authorities` | Forbidden | UI/API calls orchestrator. |
| `Worker/job -> multiple authorities` | Forbidden | Worker/job calls orchestrator. |

Wave 3.3 specifically found four current direct Option -> Student source imports. These contracts mark that edge as forbidden for future constitutional architecture.

## 10. Event Taxonomy

All events use the shared event envelope from Wave 3.3.1: event ID, schema version, flow ID, request ID, student ID, authority, correlation ID, causation ID, timestamp, payload reference, payload hash, policy version, authority version, privacy class, and idempotency key.

### 10.1 Student Events

| Event | Owner | Meaning |
| --- | --- | --- |
| `student.profile.input.accepted` | StudentUnderstandingAuthority | Raw profile input accepted. |
| `assessment.input.processed` | StudentUnderstandingAuthority | Assessment responses processed into signals. |
| `archetype.input.processed` | StudentUnderstandingAuthority | Archetype evidence processed. |
| `student.model.created` | StudentUnderstandingAuthority | New student model snapshot created. |
| `student.model.updated` | StudentUnderstandingAuthority | New model version created. |
| `understanding.confidence.updated` | StudentUnderstandingAuthority | Understanding confidence changed. |

### 10.2 Recommendation Events

| Event | Owner | Meaning |
| --- | --- | --- |
| `recommendation.request.accepted` | OptionGeneratorAuthority | Recommendation generation accepted. |
| `recommendations.generated` | OptionGeneratorAuthority | Recommendation output snapshot created. |
| `options.ranked` | OptionGeneratorAuthority | Ranking completed. |
| `pathways.generated` | OptionGeneratorAuthority | Pathway output snapshot created. |
| `future.scenarios.generated` | OptionGeneratorAuthority | Future simulation output snapshot created. |
| `option.explanation.generated` | OptionGeneratorAuthority | Explanation for option output created. |
| `recommendation.exposure.registered` | OutcomeTrackerAuthority via orchestrator | Recommendation shown to user has been registered for outcome tracking. |

### 10.3 Outcome Events

| Event | Owner | Meaning |
| --- | --- | --- |
| `outcome.submission.accepted` | OutcomeTrackerAuthority | Outcome submission accepted. |
| `outcome.observation.created` | OutcomeTrackerAuthority | Normalized outcome observation created. |
| `outcome.record.updated` | OutcomeTrackerAuthority | Outcome record updated by append-only operation. |
| `outcome.timeline.updated` | OutcomeTrackerAuthority | Timeline entry appended. |
| `quality.metrics.generated` | OutcomeTrackerAuthority | Quality metrics created. |
| `calibration.report.generated` | OutcomeTrackerAuthority | Calibration report created. |

### 10.4 Audit Events

| Event | Owner | Meaning |
| --- | --- | --- |
| `flow.received` | IntelligenceOrchestrator | Flow accepted. |
| `flow.classified` | IntelligenceOrchestrator | Constitutional route selected. |
| `policy.allowed` | IntelligenceOrchestrator | Policy allowed route. |
| `policy.denied` | IntelligenceOrchestrator | Policy denied route. |
| `authority.call.started` | IntelligenceOrchestrator | Authority call began. |
| `authority.call.completed` | IntelligenceOrchestrator | Authority call completed. |
| `authority.call.failed` | IntelligenceOrchestrator | Authority call failed. |
| `audit.record.created` | IntelligenceOrchestrator | Audit ledger record created. |

### 10.5 Learning Events

| Event | Owner | Meaning |
| --- | --- | --- |
| `learning.signal.generated` | OutcomeTrackerAuthority | Learning signal created. |
| `learning.signal.routed` | IntelligenceOrchestrator | Signal routed to target authority. |
| `understanding.learning.applied` | StudentUnderstandingAuthority | Learning signal applied to understanding. |
| `generation.learning.applied` | OptionGeneratorAuthority | Learning signal applied to generation behavior. |
| `learning.signal.rejected` | Target authority | Signal rejected with reason. |
| `learning.signal.deadlettered` | IntelligenceOrchestrator | Delivery failed or policy blocked signal. |

## 11. Versioning Strategy

### 11.1 Backward Compatibility Rules

| Rule | Requirement |
| --- | --- |
| Additive changes | Allowed in minor versions when fields are optional and defaults are clear. |
| Required field changes | Major version only. |
| Field removal | Major version only after deprecation window. |
| Enum additions | Minor version if consumers must ignore unknown values safely. |
| Enum removals or semantic changes | Major version only. |
| Event payload changes | Must include schema version and backward-compatible adapter. |
| Authority command changes | Must preserve old contract until deprecation ends. |

### 11.2 Contract Evolution

This is the contract evolution model for all authority commands, queries, outputs, and events.

| Stage | Behavior |
| --- | --- |
| `draft` | Design-only or internal review contract. |
| `active` | Supported production contract. |
| `deprecated` | Still supported, warnings emitted, replacement specified. |
| `sunset` | No new callers allowed, existing callers must migrate. |
| `removed` | Contract no longer accepted. |

### 11.3 Deprecation Policy

- Deprecations must identify replacement contract, migration path, and removal date.
- Runtime warnings should be structured events, not only logs.
- Deprecated contracts must continue to emit audit and policy metadata.
- Backward-compatible adapters may exist behind the authority facade.
- No deprecated contract may bypass `IntelligenceOrchestrator`.

### 11.4 Version Fields

Every command, query, event, and output must include:

- `contractVersion`
- `schemaVersion` for events
- `authorityVersion`
- `policyVersion`
- source data version where applicable
- snapshot version where applicable

## 12. Scalability Design

### 12.1 Contract Requirements for 10M+ Students

| Requirement | Contract design |
| --- | --- |
| Horizontal scaling | All commands and events carry idempotency keys, partition keys, and durable payload references. |
| Per-student ordering | Student-scoped events use `studentId` as partition key when order matters. |
| Replayability | All events include causation, correlation, payload hash, and snapshot refs. |
| Async processing | Commands may return `queued` with flow status query support. |
| Backpressure | Orchestrator can return queued/deferred states and emit backpressure events. |
| Large payloads | Payloads use `payloadRef` plus `payloadHash`. |
| Privacy | Privacy class and consent context travel with every student-scoped payload. |
| Hot partitions | Contracts support flow-level partitioning and batch processing for high-volume students or cohorts. |

### 12.2 Async Processing Pattern

1. Orchestrator receives command in `RequestEnvelope`.
2. Orchestrator validates policy and creates `AuthorityRouting`.
3. Orchestrator persists lifecycle state and audit record.
4. Orchestrator dispatches authority command synchronously or via event bus.
5. Authority emits accepted, completed, or failed event.
6. Orchestrator updates lifecycle state and dispatches downstream steps.
7. Caller polls `GetFlowStatusQuery`, receives webhook, or consumes completion event.

### 12.3 Batch Contract Pattern

Batch APIs should be contract-level features, not ad hoc loops.

| Batch field | Purpose |
| --- | --- |
| `batchId` | Unique batch command ID. |
| `items` | Per-student or per-flow request references. |
| `maxConcurrency` | Caller-specified or policy-limited concurrency. |
| `partitionPolicy` | Student, cohort, authority, or time-bucket partitioning. |
| `partialFailurePolicy` | Continue, stop, retry failed, or dead-letter failed. |
| `resultRefs` | Per-item result references. |

### 12.4 Event-Driven Architecture

Contracts should support:

- Durable outbox for event publication.
- Durable inbox for idempotent event consumption.
- At-least-once event delivery with idempotent handlers.
- Dead-letter records with audit refs.
- Event replay by `studentId`, `flowId`, `eventId`, and time range.
- Batch learning signal routing.
- Authority health and circuit breaker events.

## 13. Constitutional Compliance Validation

### 13.1 No Ownership Overlap

| Behavior | Sole owner | Contract enforcement |
| --- | --- | --- |
| Student knowledge creation | StudentUnderstandingAuthority | Only student authority commands produce `StudentModelOutput`. |
| Assessment interpretation | StudentUnderstandingAuthority | `AssessmentInput` accepted only by student authority through orchestrator. |
| Archetype inference | StudentUnderstandingAuthority | `ArchetypeInput` accepted only by student authority. |
| Recommendation generation | OptionGeneratorAuthority | `RecommendationRequest` accepted only by option authority. |
| Ranking options | OptionGeneratorAuthority | `RankedOptionsOutput` produced only by option authority, except final decision ranking owned by `DecisionAuthority` when that adjacent authority is invoked. |
| Pathway generation | OptionGeneratorAuthority | `PathwayRequest` accepted only by option authority. |
| Future simulation | OptionGeneratorAuthority | `FutureSimulationRequest` accepted only by option authority. |
| Outcome learning | OutcomeTrackerAuthority | `LearningSignal` generated only by outcome authority. |
| Feedback processing | OutcomeTrackerAuthority | `OutcomeSubmission` and `OutcomeObservation` accepted only by outcome authority. |
| Cross-authority routing | IntelligenceOrchestrator | Only orchestrator creates `AuthorityRouting`. |
| Audit lifecycle | IntelligenceOrchestrator | Only orchestrator creates cross-authority `AuditTrailRecords`. |

### 13.2 No Shadow Authorities

The contracts prevent shadow authorities by requiring:

- UI, API, workers, and jobs call orchestrator for cross-authority workflows.
- Orchestrator calls only authority facades, not internal engine files.
- Authority outputs include authority owner and version.
- Authority events include owner and policy version.
- Direct authority-to-authority command edges are forbidden.
- Learning distribution is signal-based and orchestrator-routed.
- Response synthesis cannot create new profile, recommendation, ranking, future, pathway, or learning logic.

### 13.3 Clear Accountability

| Accountability question | Contract answer |
| --- | --- |
| Who created this student understanding? | `StudentModelOutput.authority`, `authorityVersion`, lineage, and audit ref. |
| Who generated this recommendation? | `RankedOptionsOutput.authority`, generation event, and snapshot ref. |
| Who tracked this outcome? | `OutcomeSubmission`, `OutcomeObservation`, and outcome event refs. |
| Who routed this flow? | `AuthorityRouting` and `AuditTrailRecords` owned by orchestrator. |
| Who allowed or denied the route? | Orchestrator policy decision with `policyVersion`. |
| Who should receive a learning signal? | `LearningSignal.targetAuthority`, routed by orchestrator. |

### 13.4 Final Compliance Statement

This contract design is constitutionally compliant because:

1. It assigns every input, output, command, query, and event to exactly one authority owner.
2. It forbids direct authority-to-authority command dependencies.
3. It makes `IntelligenceOrchestrator` the only cross-authority router.
4. It preserves existing intelligence systems behind future authority facades.
5. It represents learning feedback as orchestrator-routed signals, not direct dependencies.
6. It produces auditable, versioned, replayable records for every authority interaction.
7. It scales through idempotency, durable references, event envelopes, partition keys, async processing, and batch contracts.

## 14. Final Contract Verdict

The Wave 3.3.2 authority contracts define an enterprise-ready boundary layer for CareerOS V2:

```text
IntelligenceOrchestrator
  -> StudentUnderstandingAuthority
  -> OptionGeneratorAuthority
  -> OutcomeTrackerAuthority
  -> IntelligenceOrchestrator-routed learning feedback
```

The contracts do not implement new code. They define the stable API language required to eliminate shadow intelligence systems while preserving the current 444-file intelligence surface behind constitutional authority facades.
