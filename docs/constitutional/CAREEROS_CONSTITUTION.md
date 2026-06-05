# CareerOS Constitution

**Status:** Production constitutional reference  
**Source basis:** Existing repository documentation in `docs/` and `constitutional-audits/`  
**Created:** 2026-06-05  
**Audience:** Future Codex sessions and engineers making architectural changes

This document records the current constitutional decisions for CareerOS. It is not a new audit and does not introduce new architecture beyond what is documented in the repository. It consolidates the authority model and ownership rules established by the constitutional audit trail, especially Wave 3.1 and Wave 3.2.

Before making architectural changes, read this document and the source documents listed at the end.

---

## 1. Product Identity

CareerOS is an **AI Career Intelligence System**.

Repository evidence:

- `docs/constitutional/Wave3_2_FinalVerdict.md` states the product vision as a "World-class AI Career Intelligence System serving millions of students."
- `docs/intelligence-architecture/01-system-overview.md` describes CareerOS Intelligence as a system that guides students toward optimal career decisions by building student understanding, analyzing careers, generating recommendations, optimizing for long-term outcomes, translating insights into action, and tracking outcomes.
- `docs/CAREER-REALITY-ENGINE.md` defines a major intelligence system around the question: "What is life actually like in this career?"

CareerOS is therefore not just a recommendation app. It is a multi-stage intelligence system that understands a student, generates career/life options, supports decisions, and learns from outcomes.

---

## 2. Constitutional Objective

CareerOS must optimize for the **best long-term life outcome** for the student.

Repository evidence for this objective:

- `docs/intelligence-architecture/01-system-overview.md` defines the Optimization Layer purpose as "Optimize for long-term outcomes" and names Utility Intelligence, Optionality Intelligence, Regret Intelligence, and Future Simulation as that layer.
- `docs/intelligence-architecture/17-future-simulation.md` states that Future Simulation helps students visualize and compare long-term outcomes and understand the compounding effects of decisions.
- `docs/constitutional/FeatureOwnershipMatrix.md` defines the Long-Term Fulfillment Predictor as predicting long-term career satisfaction and life fulfillment.
- `docs/CAREER-REALITY-ENGINE.md` includes life-like career reality, sacrifices, burnout risk, work-life balance, long-term toll, satisfaction drivers, fulfillment trajectory, and meaningful work as success criteria.
- `docs/intelligence-architecture/20-outcome-tracking.md` states that outcome tracking closes the feedback loop and notes that long-term outcomes must be tracked.

Constitutional interpretation:

- Short-term recommendation quality is not enough.
- Career fit, market opportunity, optionality, regret, reality, satisfaction, and outcome learning must be coordinated toward long-term student flourishing.
- Any intelligence component that optimizes only a local metric must remain subordinate to the constitutional authority flow.

---

## 3. Core Constitutional Model

Wave 3.2 validates the current constitutional model:

```text
IntelligenceOrchestrator
  -> StudentUnderstandingAuthority
  -> OptionGeneratorAuthority
  -> OutcomeTrackerAuthority
```

This model is summarized by the intelligence flow:

```text
UNDERSTAND -> GENERATE -> LEARN
```

Repository evidence:

- `docs/constitutional/Wave3_2_FinalVerdict.md` validates the 3-authority model as production-grade and vision-aligned.
- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md` identifies three primary intelligence flows: UNDERSTAND, GENERATE, and LEARN.
- `docs/constitutional/ConstitutionalStressTest.md` confirms that the model supports the six major workflows with clean ownership transitions, but requires the orchestrator.
- `docs/constitutional/ShadowIntelligenceDetection.md` concludes that all shadow systems are implementation gaps, not flaws in the 3-authority model.

---

## 4. Meta-Authority: IntelligenceOrchestrator

`IntelligenceOrchestrator` is the meta-authority.

It is required to coordinate all cross-authority flows and prevent new shadow authority emergence.

Constitutional responsibilities:

- Route requests to the correct authority.
- Coordinate UNDERSTAND -> GENERATE -> LEARN flows.
- Pass `StudentLifeProfile` or other understanding outputs from StudentUnderstandingAuthority to OptionGeneratorAuthority.
- Pass generated options and user actions to OutcomeTrackerAuthority.
- Distribute learning signals and calibration outputs back through the system.
- Resolve conflicts between authority outputs.
- Synthesize multi-authority results.
- Enforce constitutional ownership boundaries.

Repository evidence:

- `docs/constitutional/Wave3_2_FinalVerdict.md` identifies the missing IntelligenceOrchestrator as a critical weakness and states that no system currently coordinates UNDERSTAND -> GENERATE -> LEARN.
- `docs/constitutional/ConstitutionalStressTest.md` states that IntelligenceOrchestrator is required for all major workflows and that without it, cross-authority coordination becomes ad hoc and shadow authority risk returns.
- `docs/constitutional/ShadowIntelligenceDetection.md` identifies the missing IntelligenceOrchestrator as a critical gap.

Current status from the audit trail:

- Required.
- Not implemented according to Wave 3.2.
- Critical for constitutional compliance.

---

## 5. Domain Authority: StudentUnderstandingAuthority

`StudentUnderstandingAuthority` owns UNDERSTAND.

It is the sole constitutional owner of student knowledge creation.

Constitutional input:

- Raw student data.
- Assessment responses.
- Profile data.
- Behavioral signals.
- Student values, motivations, constraints, context, historical signals, and relevant feedback signals.

Constitutional output:

- `StudentLifeProfile`
- Archetype profile.
- Profile interpretation.
- Assessment signals.
- Dimension scores.
- Confidence/calibration signals that are part of student understanding.
- Student beliefs, values, growth profile, risk profile, bias profile, and trajectory understanding.

Constitutional responsibilities:

- Convert raw student inputs into structured student understanding.
- Preserve context and student-specific constraints.
- Produce the student understanding consumed by option generation.
- Explain student-understanding outputs within this authority boundary.
- Apply learning signals that update student understanding.

Ownership rule:

No system outside StudentUnderstandingAuthority may create student knowledge.

Repository evidence:

- `docs/constitutional/StudentUnderstandingOwnershipAudit.md` identifies 28 systems that create student knowledge and states that all 28 belong inside StudentUnderstandingAuthority.
- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md` maps UNDERSTAND to 28 systems, 4 entry points, 7 intermediate processors, and one primary output: `StudentLifeProfile`.
- `docs/constitutional/Wave3_2_FinalVerdict.md` defines StudentUnderstandingAuthority as Input=Raw data and Output=StudentLifeProfile.

---

## 6. Domain Authority: OptionGeneratorAuthority

`OptionGeneratorAuthority` owns GENERATE.

It is the sole constitutional owner of option generation: recommendations, paths, futures, guidance tied to options, comparisons, market-aware options, and simulations.

Constitutional input:

- `StudentLifeProfile`
- Career universe and taxonomy.
- Market intelligence.
- Career reality profiles.
- Learning and calibration signals from OutcomeTrackerAuthority via IntelligenceOrchestrator.

Constitutional output:

- Career recommendations.
- Career paths.
- Future scenarios.
- Matched careers.
- Option scores.
- Option explanations.
- Market-aware options.
- Career reality outputs that inform choices.
- Risk, regret, utility, optionality, and trajectory analyses when they are used to generate or compare options.

Constitutional responsibilities:

- Generate options for the student.
- Score, rank, validate, compare, explain, and synthesize options.
- Model career paths, futures, trade-offs, market signals, and career reality when used for option generation.
- Keep guidance, market intelligence, explanations, and simulations inside option generation when their purpose is to help produce or explain options.

Ownership rule:

No system outside OptionGeneratorAuthority may generate career options, pathways, future scenarios, recommendations, option guidance, or option explanations.

Repository evidence:

- `docs/constitutional/OptionGenerationOwnershipAudit.md` identifies 100 systems that generate career options, pathways, and futures and states that all 100 belong inside OptionGeneratorAuthority.
- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md` maps GENERATE to 100 systems and output groups including recommendations, paths, and futures.
- `docs/constitutional/Wave3_2_FinalVerdict.md` states that market authority, guidance authority, and explanation authority are not recommended as separate authorities because they create coupling and belong inside OptionGeneratorAuthority when they support option generation.
- `docs/constitutional/FeatureOwnershipMatrix.md` finds that OptionGeneratorAuthority has the highest average ownership across frontier features.

---

## 7. Domain Authority: OutcomeTrackerAuthority

`OutcomeTrackerAuthority` owns LEARN.

It is the sole constitutional owner of outcome tracking and outcome learning.

Constitutional input:

- Recommendation events.
- Decision events.
- Action events.
- Outcome events.
- Feedback.
- Quality metrics.
- Follow-up data.
- Satisfaction and fulfillment signals.

Constitutional output:

- Learning signals.
- Calibration reports.
- Outcome records.
- Quality reports.
- Cohort insights.
- Pattern-learning results.
- Growth indicators.
- Decision and recommendation outcome patterns.

Constitutional responsibilities:

- Track what happened after options were generated.
- Process student feedback and outcome events.
- Learn from real-world results.
- Calibrate predictions and confidence.
- Produce learning signals for StudentUnderstandingAuthority, OptionGeneratorAuthority, and DecisionAuthority through IntelligenceOrchestrator.

Ownership rule:

No system outside OutcomeTrackerAuthority may learn from outcomes or own outcome-learning signals.

Repository evidence:

- `docs/constitutional/OutcomeLearningOwnershipAudit.md` identifies 28 systems that learn from results and states that all 28 belong inside OutcomeTrackerAuthority.
- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md` maps LEARN to 28 systems, 4 entry points, 10 intermediate processors, and outputs including learning, calibration, and quality.
- `docs/constitutional/Wave3_2_FinalVerdict.md` identifies cross-authority learning distribution as a known medium-severity complexity that the orchestrator must handle.

Special boundary note:

- `StudentGrowthEngine` is 95% assigned to OutcomeTrackerAuthority because it primarily tracks growth over time, while its outputs feed StudentUnderstandingAuthority. This is an accepted cross-boundary output according to Wave 3.2, not a separate authority.

---

## 8. Adjacent Constitutional Authorities

The Wave 3.2 Career Intelligence model centers on three domain authorities plus the meta-orchestrator. The existing audit trail also records adjacent constitutional authorities that must not be bypassed.

### DecisionAuthority

`DecisionAuthority` is the constitutional owner for decision operations already migrated through Wave 2.

Repository evidence:

- `docs/constitutional/Wave2_5_Certification.md` states that Wave 2.5 was completed successfully with production-ready constitutional architecture and behavioral parity.
- `docs/constitutional/Wave2_5_ComplianceReport.md` states that DecisionAuthority is the sole decision maker.
- `docs/constitutional/Wave3_2_FinalVerdict.md` recommends DecisionAuthority as an additional authority for final selection, comparison, and arbitration, but notes that it is not required for the 3-authority model itself.

Constitutional boundary:

- OptionGeneratorAuthority generates and compares options when comparison is part of option generation.
- DecisionAuthority owns final decision operations, arbitration, selection, and generic decision logic where those functions are present.
- OutcomeTrackerAuthority may send decision learning signals to DecisionAuthority through IntelligenceOrchestrator.

### ConfidenceAuthority

`ConfidenceAuthority` is the constitutional owner for confidence generation where the confidence system is in scope.

Repository evidence:

- `constitutional-audits/Wave1_COMPLETE_Final_Report.md` states that ConfidenceAuthority is the single constitutional owner of all confidence generation.
- `constitutional-audits/Wave1_6_Final_Certification.md` certifies ConfidenceAuthority as constitutionally complete and the sole confidence generator.

Constitutional boundary:

- Do not create new local confidence calculators outside the confidence authority boundary.
- Where student understanding or option generation includes confidence-like fields, they must consume or delegate to the constitutional confidence model rather than create an independent confidence system.

---

## 9. Constitutional Ownership Rules

These rules govern all future architecture and implementation changes.

### Rule 1: One Responsibility, One Authority

Every intelligence responsibility must have exactly one constitutional owner.

Evidence:

- Wave 1 consolidated confidence ownership into ConfidenceAuthority.
- Wave 2 consolidated decision ownership into DecisionAuthority.
- Wave 3.2 validates the three intelligence authorities for student understanding, option generation, and outcome learning.

### Rule 2: No Shadow Intelligence

A shadow intelligence system is any system that performs authority behavior without delegating to the relevant authority.

Forbidden shadow behavior includes:

- Creating student knowledge outside StudentUnderstandingAuthority.
- Generating options outside OptionGeneratorAuthority.
- Learning from outcomes outside OutcomeTrackerAuthority.
- Coordinating cross-authority flows outside IntelligenceOrchestrator.
- Making decision operations outside DecisionAuthority where DecisionAuthority owns that behavior.
- Generating confidence outside ConfidenceAuthority where ConfidenceAuthority owns that behavior.

Repository evidence:

- `docs/constitutional/Wave3_1_IntelligenceDiscoveryAudit.md` discovered 313 intelligence systems, 312 operating as shadow authorities.
- `docs/constitutional/ShadowIntelligenceDetection.md` states that the 312 shadow intelligence systems are local orchestration violations.
- `docs/constitutional/Wave3_2_FinalVerdict.md` states that shadow systems are intra-authority orchestration gaps, not cross-authority violations.

### Rule 3: Orchestration Is a Constitutional Responsibility

Cross-authority coordination must happen through IntelligenceOrchestrator.

Forbidden patterns:

- Direct ad hoc calls from UI or feature code into multiple authorities.
- Point-to-point learning distribution between authorities.
- Local synthesis of authority outputs by non-authority systems.
- Local conflict resolution when multiple authorities participate.

Repository evidence:

- `docs/constitutional/ConstitutionalStressTest.md` states that all six major workflows require IntelligenceOrchestrator.
- `docs/constitutional/Wave3_2_FinalVerdict.md` identifies missing cross-authority coordination, conflict resolution, synthesis coordination, and constitutional enforcement as the critical orchestrator gap.

### Rule 4: Authorities Own Explanation of Their Own Outputs

Explanations are domain-specific.

Ownership:

- StudentUnderstandingAuthority explains student-understanding outputs.
- OptionGeneratorAuthority explains generated options, recommendations, paths, futures, and option trade-offs.
- OutcomeTrackerAuthority explains outcome learning, calibration, and quality outputs.

Repository evidence:

- `docs/constitutional/Wave3_2_FinalVerdict.md` rejects a separate ExplanationAuthority because centralizing explanations would create knowledge leaks and coupling.

### Rule 5: Market and Guidance Stay Inside Option Generation Unless Their Behavior Changes

Market intelligence and guidance systems belong inside OptionGeneratorAuthority when their purpose is option generation, option scoring, option explanation, or option guidance.

Repository evidence:

- `docs/constitutional/Wave3_2_FinalVerdict.md` rejects MarketAuthority because market intelligence is used for option generation and separation would create unnecessary coupling.
- The same document rejects GuidanceAuthority because guidance is option-dependent.
- `docs/constitutional/OptionGenerationOwnershipAudit.md` assigns market, explanation, guidance, validation, scoring, ranking, recommendation, pathway, and future systems to OptionGeneratorAuthority.

### Rule 6: Learning Flows Back as Signals, Not Dependencies

OutcomeTrackerAuthority may produce signals that improve student understanding, option generation, and decisions, but those signals must be distributed through IntelligenceOrchestrator.

Repository evidence:

- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md` identifies LEARN -> GENERATE and LEARN -> UNDERSTAND dependencies.
- `docs/constitutional/Wave3_2_FinalVerdict.md` states that LEARN feeds back to UNDERSTAND and GENERATE as signals, not dependencies.

### Rule 7: New Systems Must Be Classified Before Implementation

Before adding or changing an intelligence system, classify it as one of:

- UNDERSTAND: creates student knowledge.
- GENERATE: generates, scores, validates, compares, explains, or simulates options.
- LEARN: tracks outcomes or creates learning/calibration signals.
- ORCHESTRATE: coordinates authorities, resolves conflicts, synthesizes outputs, or enforces compliance.
- DECIDE: final decision, arbitration, selection, or generic decision logic owned by DecisionAuthority.
- CONFIDENCE: confidence generation owned by ConfidenceAuthority.

If a system appears to do more than one, split the behavior or route coordination through IntelligenceOrchestrator.

---

## 10. Intelligence Flow

The constitutional intelligence flow is:

```text
UNDERSTAND -> GENERATE -> LEARN
```

### UNDERSTAND

Purpose:

- Transform raw student inputs into structured student knowledge.

Authority:

- StudentUnderstandingAuthority.

Primary output:

- `StudentLifeProfile`.

### GENERATE

Purpose:

- Transform student understanding into options.

Authority:

- OptionGeneratorAuthority.

Primary outputs:

- Recommendations.
- Paths.
- Future scenarios.
- Option explanations.
- Option risk/utility/optionality/regret analysis.

### LEARN

Purpose:

- Transform events and outcomes into learning signals.

Authority:

- OutcomeTrackerAuthority.

Primary outputs:

- Learning signals.
- Calibration.
- Quality reports.
- Pattern learning.

### Feedback

Learning may flow back to UNDERSTAND and GENERATE only as orchestrated signals:

```text
LEARN -> IntelligenceOrchestrator -> StudentUnderstandingAuthority
LEARN -> IntelligenceOrchestrator -> OptionGeneratorAuthority
LEARN -> IntelligenceOrchestrator -> DecisionAuthority
```

Repository evidence:

- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md`
- `docs/constitutional/ConstitutionalStressTest.md`
- `docs/constitutional/Wave3_2_FinalVerdict.md`

---

## 11. Wave 3.1 Findings

Wave 3.1 was the intelligence discovery audit.

Key findings:

- 313 intelligence systems were discovered.
- 312 systems were classified as shadow authorities.
- Only 1 system, DecisionAuthority, maintained constitutional compliance.
- No IntelligenceAuthority existed.
- The architecture showed extreme fragmentation with no central intelligence coordination.
- Shadow patterns included:
  - 47 local recommendation generators.
  - 89 local ranking systems.
  - 24 local future projection systems.
  - 29 local pathway generators.
  - 38 local guidance generators.
  - 42 market intelligence systems.
  - 18 archetype systems.
  - 28 outcome tracking systems.
- Risk was assessed as critical due to inconsistent recommendations, conflicting guidance, user confusion, loss of trust, maintenance burden, and architectural debt.

Wave 3.1 initially recommended a broader set of 9 constitutional authorities. Wave 3.2 superseded that recommendation after behavioral analysis validated a smaller 3-authority plus meta-orchestrator model.

Source:

- `docs/constitutional/Wave3_1_IntelligenceDiscoveryAudit.md`

---

## 12. Wave 3.2 Findings

Wave 3.2 performed behavioral analysis, flow mapping, ownership audits, feature ownership analysis, stress testing, and final constitutional validation.

Key findings:

- The 3-authority model is validated and production-grade.
- 313 systems naturally cluster into three behavioral domains:
  - UNDERSTAND: 28 systems.
  - GENERATE: 100 systems.
  - LEARN: 28 systems.
- The natural flow UNDERSTAND -> GENERATE -> LEARN matches actual data flows.
- No cross-authority function conflicts were detected.
- No system creates student knowledge outside UNDERSTAND.
- No system generates options outside GENERATE.
- No system learns from outcomes outside LEARN.
- All 312 shadow systems are intra-authority orchestration gaps, not cross-authority violations.
- All 10 frontier features are supported by the model.
- All 6 major workflows are supported with clean ownership transitions.
- IntelligenceOrchestrator is required for all workflows.
- Missing IntelligenceOrchestrator is the critical remaining constitutional weakness.
- Authority consolidation is still required:
  - 28 understanding systems into StudentUnderstandingAuthority.
  - 100 generation systems into OptionGeneratorAuthority, with consolidation toward 40.
  - 28 learning systems into OutcomeTrackerAuthority.
  - 1 new IntelligenceOrchestrator.
- Cross-authority learning distribution must be handled by the orchestrator.
- StudentGrowthEngine is the one accepted low-severity cross-boundary case: primarily LEARN behavior, with output feeding UNDERSTAND.

Sources:

- `docs/constitutional/Wave3_2_FinalVerdict.md`
- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md`
- `docs/constitutional/StudentUnderstandingOwnershipAudit.md`
- `docs/constitutional/OptionGenerationOwnershipAudit.md`
- `docs/constitutional/OutcomeLearningOwnershipAudit.md`
- `docs/constitutional/FeatureOwnershipMatrix.md`
- `docs/constitutional/ConstitutionalStressTest.md`
- `docs/constitutional/ShadowIntelligenceDetection.md`

---

## 13. Required Reader Protocol for Future Architectural Changes

Before changing architecture or implementing a new intelligence component:

1. Identify whether the behavior is UNDERSTAND, GENERATE, LEARN, ORCHESTRATE, DECIDE, or CONFIDENCE.
2. Route the behavior to the relevant authority.
3. If more than one authority is needed, use IntelligenceOrchestrator.
4. Do not add local scoring, ranking, recommendation, explanation, prediction, learning, confidence, or decision logic unless it is inside the constitutional owner.
5. Do not create a new authority unless existing constitutional docs explicitly establish it or a new constitutional audit updates this document.
6. If the work touches long-term fulfillment, future simulation, life trajectory, career reality, regret, utility, optionality, or outcomes, verify that the change still optimizes for long-term student life outcomes rather than a local metric.
7. Preserve evidence. Architectural changes must cite the authority they belong to and the reason.

---

## 14. Source Documents

Primary Wave 3 sources:

- `docs/constitutional/Wave3_1_IntelligenceDiscoveryAudit.md`
- `docs/constitutional/Wave3_2_FinalVerdict.md`
- `docs/constitutional/Wave3_2_IntelligenceFlowMap.md`
- `docs/constitutional/ShadowIntelligenceDetection.md`
- `docs/constitutional/ConstitutionalStressTest.md`
- `docs/constitutional/FeatureOwnershipMatrix.md`
- `docs/constitutional/StudentUnderstandingOwnershipAudit.md`
- `docs/constitutional/OptionGenerationOwnershipAudit.md`
- `docs/constitutional/OutcomeLearningOwnershipAudit.md`

Supporting constitutional sources:

- `docs/constitutional/Wave2_5_Certification.md`
- `docs/constitutional/Wave2_5_ComplianceReport.md`
- `constitutional-audits/Wave1_COMPLETE_Final_Report.md`
- `constitutional-audits/Wave1_6_Final_Certification.md`

Supporting product and intelligence sources:

- `docs/intelligence-architecture/01-system-overview.md`
- `docs/intelligence-architecture/17-future-simulation.md`
- `docs/intelligence-architecture/20-outcome-tracking.md`
- `docs/CAREER-REALITY-ENGINE.md`

---

## 15. Constitutional Summary

CareerOS is an AI Career Intelligence System whose constitutional objective is to optimize for the student's best long-term life outcome.

The current constitutional model is:

```text
IntelligenceOrchestrator
  coordinates:
    StudentUnderstandingAuthority
    OptionGeneratorAuthority
    OutcomeTrackerAuthority
```

The core intelligence loop is:

```text
UNDERSTAND -> GENERATE -> LEARN
```

Shadow intelligence systems must be eliminated by moving authority behavior into the constitutional owner and routing cross-authority coordination through IntelligenceOrchestrator.

