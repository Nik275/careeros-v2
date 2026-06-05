# Wave 3.3.3 - Boundary Violation Audit

## 1. Source Basis

This audit follows the constitutional source of truth in `docs/constitutional/CAREEROS_CONSTITUTION.md` and the Wave 3.3 / 3.3.1 / 3.3.2 reports.

Read inputs:

- `docs/constitutional/CAREEROS_CONSTITUTION.md`
- `docs/constitutional/Wave3_3_1_IntelligenceOrchestratorBlueprint.md`
- `docs/constitutional/Wave3_3_2_AuthorityContracts.md`
- `docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md`
- `docs/constitutional/Wave3_3_AuthorityInventory.md`
- `docs/constitutional/Wave3_3_OwnershipViolations.md`
- `docs/constitutional/Wave3_3_ShadowIntelligenceReport.md`
- `docs/constitutional/Wave3_3_FinalVerdict.md`

Fresh Wave 3.3.3 source scan facts:

- Repository: `C:\Users\a\Projects\careeros-v2`
- Source tree scanned: `src/`
- TypeScript files in `src/`: 802
- Intelligence ownership map rows parsed: 444
- Direct imports into mapped intelligence files: 839
- Direct cross-authority imports: 4
- Direct imports from non-owned files into authority-owned files: 393
- Non-owned files with transitive reach into authority-owned systems: 131
- Non-owned files with transitive reach into more than one authority: 2

## 2. Constitutional Boundary Baseline

The constitution defines CareerOS as an AI Career Intelligence System with the intelligence flow:

```text
UNDERSTAND -> GENERATE -> LEARN
```

Authority ownership:

| Authority | Owns |
| --- | --- |
| `StudentUnderstandingAuthority` | Assessment interpretation, profile understanding, archetype inference, student modeling, student confidence in understanding |
| `OptionGeneratorAuthority` | Recommendation generation, ranking, matching, pathway generation, roadmap generation, future simulation, market intelligence, regret intelligence, mentor intelligence, option explanations |
| `OutcomeTrackerAuthority` | Outcome tracking, feedback processing, learning loops, calibration, quality metrics, performance evaluation |
| `IntelligenceOrchestrator` | Cross-authority routing, workflow lifecycle, event dispatch, state coordination, audit trail, constitutional enforcement |

Adjacent constitutional authorities already exist in source and must not be bypassed:

- `src/intelligence/decision/DecisionAuthority.ts`
- `src/intelligence/decision/IDecisionAuthority.ts`
- `src/intelligence/decision/meta/MetaDecisionAuthority.ts`
- `src/intelligence/confidence/ConfidenceAuthority.ts`
- `src/intelligence/confidence/IConfidenceAuthority.ts`

The governing communication rule from Wave 3.3.2 is:

```text
Orchestrator -> Any Authority
```

All authority-to-authority communication must pass through `IntelligenceOrchestrator`.

## 3. Current Violation Counts

The counts below are not additive because categories overlap. For example, a single source file can be part of the 444 shadow systems, one duplicate cluster, and one local orchestration hotspot.

| Violation class | Current count | Evidence |
| --- | ---: | --- |
| Direct forbidden cross-authority imports | 4 | Fresh import scan and `Wave3_3_OwnershipViolations.md` |
| Direct circular authority dependencies | 0 | Fresh import scan and `Wave3_3_FinalVerdict.md` |
| Missing core constitutional source facades | 4 | `StudentUnderstandingAuthority`, `OptionGeneratorAuthority`, `OutcomeTrackerAuthority`, and `IntelligenceOrchestrator` not found in `src/` |
| Shadow intelligence systems | 444 | Every discovered intelligence implementation file performs authority behavior without a Wave 3 authority facade |
| Option/recommendation behavior outside `OptionGeneratorAuthority` facade | 339 | Authority inventory and ownership map |
| Student/assessment behavior outside `StudentUnderstandingAuthority` facade | 50 | Authority inventory and ownership map |
| Outcome/learning behavior outside `OutcomeTrackerAuthority` facade | 55 | Authority inventory and ownership map |
| Orchestration behavior outside `IntelligenceOrchestrator` | 55 | Local orchestration hotspots in `Wave3_3_OwnershipViolations.md` |
| Duplicate or overlapping intelligence clusters | 12 | Duplicate cluster table in `Wave3_3_OwnershipViolations.md` |
| Non-owned direct imports into owned intelligence systems | 393 | Fresh source import scan |
| Non-owned files with transitive reach into owned intelligence systems | 131 | Fresh source import graph scan |
| Non-owned files reaching multiple authority domains | 2 | `src/intelligence/index.ts` and `src/intelligence/counterfactual-engine/__tests__/CounterfactualEngine.example.ts` |

Primary direct boundary violation count: 4.

Primary structural constitutional non-compliance count: 444 shadow intelligence systems.

## 4. Direct Authority Violations

Wave 3.3.3 found the same four direct cross-authority imports identified in Wave 3.3. All four are `OptionGeneratorAuthority -> StudentUnderstandingAuthority` source-level dependencies.

| # | Importing file | Importing owner | Imported file | Imported owner | Boundary violation |
| ---: | --- | --- | --- | --- | --- |
| 1 | `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentModelEngine.ts` | `StudentUnderstandingAuthority` | Option/decision-support behavior imports student model engine types directly |
| 2 | `src/intelligence/mentor/MentorEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentBelief.ts` | `StudentUnderstandingAuthority` | Mentor guidance imports student belief query behavior directly |
| 3 | `src/intelligence/recommendation-engine/RecommendationEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentBelief.ts` | `StudentUnderstandingAuthority` | Recommendation generation imports student belief query behavior directly |
| 4 | `src/intelligence/regret-engine/RegretEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentBelief.ts` | `StudentUnderstandingAuthority` | Regret analysis imports student belief query behavior directly |

Source behavior evidence:

- `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts` describes inputs as assessment responses and `StudentBelief`, then imports `AssessmentResponse` and `AssessmentResult` from `../student-model/StudentModelEngine`.
- `src/intelligence/mentor/MentorEngine.ts` describes a mentor engine with access to recommendation, regret, path, and student belief context, then imports `queryStudentBelief` from `../student-model/StudentBelief`.
- `src/intelligence/recommendation-engine/RecommendationEngine.ts` describes a multi-stage recommendation pipeline over `StudentBelief`, `DecisionCoalition`, `PathCascade`, and `RegretEngine`, then imports `queryStudentBelief` from `../student-model/StudentBelief`.
- `src/intelligence/regret-engine/RegretEngine.ts` describes regret prediction over `StudentBelief`, career paths, and historical data, then imports `queryStudentBelief` from `../student-model/StudentBelief`.

Constitutional interpretation:

- These files may consume student understanding only as an orchestrator-routed immutable student snapshot.
- They may not import or call student-model implementation files directly.
- The correct authority edge is `OptionGeneratorAuthority -> event/response -> IntelligenceOrchestrator -> StudentUnderstandingAuthority`, not direct source dependency.

Observed direct forbidden edges not found:

| Forbidden edge | Observed direct imports |
| --- | ---: |
| `StudentUnderstandingAuthority -> OptionGeneratorAuthority` | 0 |
| `StudentUnderstandingAuthority -> OutcomeTrackerAuthority` | 0 |
| `OutcomeTrackerAuthority -> StudentUnderstandingAuthority` | 0 |
| `OutcomeTrackerAuthority -> OptionGeneratorAuthority` | 0 |
| Circular authority dependency | 0 |

## 5. Hidden Authority Violations

Hidden violations are places where authority behavior is present without an explicit forbidden authority import. These are constitutional risks because enforcement cannot see them as explicit authority calls.

### 5.1 Local Orchestration Hotspots

Wave 3.3 found 55 local orchestration hotspots. Examples include:

| File | Assigned owner | Behavior |
| --- | --- | --- |
| `src/outcome-tracking/engines/outcome-tracking-engine.ts` | `OutcomeTrackerAuthority` | Tracks recommendations, decisions, actions, outcomes, cohorts, and learning events |
| `src/intelligence/market/trends/MarketTrendEngine.ts` | `OptionGeneratorAuthority` | Coordinates market snapshots, trend scoring, and market intelligence |
| `src/intelligence/prospect-theory-engine/ProspectTheoryEngine.ts` | `StudentUnderstandingAuthority` | Coordinates bias detection, distortion analysis, and student decision-state interpretation |
| `src/intelligence/meta-decision-engine/MetaDecisionEngine.ts` | `OptionGeneratorAuthority` | Coordinates decision-quality analysis, recommendation action, and decision support |
| `src/intelligence/recommendation-fusion/recommendation-fusion-engine.ts` | `OptionGeneratorAuthority` | Coordinates recommendation fusion, explanation, comparison, and exclusion reasoning |
| `src/career-reality/engines/career-reality-engine.ts` | `OptionGeneratorAuthority` | Coordinates daily life, work environment, burnout, culture, satisfaction, and reality gap engines |
| `src/intelligence/market-signal-intelligence/MarketIntelligenceEngine.ts` | `OptionGeneratorAuthority` | Coordinates market signal analysis and career/skill market intelligence |
| `src/intelligence/real-options-engine/RealOptionsEngine.ts` | `OptionGeneratorAuthority` | Coordinates real-options, future opportunity, and option value analysis |

Local orchestration inside one authority boundary is valid only after the owning authority facade controls it. Local orchestration that crosses domains, synthesizes multiple authority outputs, distributes learning, or routes lifecycle state belongs to `IntelligenceOrchestrator`.

### 5.2 Decision and Confidence Behavior Outside Explicit Adjacent Authority Routing

Wave 3.3 forced every file into one of four requested buckets, but the constitution also recognizes adjacent `DecisionAuthority` and `ConfidenceAuthority`. Current source includes decision-support and confidence-related files assigned by behavior to the three domain authorities. These are hidden violation risks when they create final decisions, arbitration, or global confidence without the adjacent authorities.

Examples:

- `src/intelligence/meta-decision-engine/MetaDecisionEngine.ts`
- `src/intelligence/decision-intelligence/decision-intelligence-engine.ts`
- `src/decision-intelligence/decision-confidence-engine.ts`
- `src/career-fit/fit-confidence-engine.ts`
- `src/intelligence/outcome-learning/confidence-calibration-engine.ts`

Constitutional boundary:

- Domain authorities may produce domain-owned scores and evidence.
- Final selection, arbitration, decision readiness, or appeal behavior must be routed through `DecisionAuthority` when it is a decision authority concern.
- Global confidence, uncertainty, reliability, calibration, or source trust must be routed through `ConfidenceAuthority` when it is a confidence authority concern.

### 5.3 Shared Utility Decision Systems

Shared or utility-style files become hidden shadow authorities when they rank, score, arbitrate, recommend, learn, or classify without being owned by an authority facade.

Detected risk surfaces:

- Barrels and public indexes that export authority-owned engines.
- Utility and example files that reach authority-owned engines transitively.
- Shared confidence/scoring helpers that may produce decision-grade outputs.
- Multi-engine "fusion", "orchestrator", "pipeline", "engine", and "router" files that coordinate several local modules without a constitutional routing layer.

## 6. Orchestrator Bypass Paths

No `IntelligenceOrchestrator` implementation exists in `src/`. Because of that, any caller that imports an intelligence engine, public barrel, or local orchestrator can bypass the constitutional meta-authority.

### 6.1 Authority -> Authority Bypass

Current direct authority bypass paths:

```text
OptionGeneratorAuthority file -> StudentUnderstandingAuthority file
```

Concrete paths:

- `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts -> src/intelligence/student-model/StudentModelEngine.ts`
- `src/intelligence/mentor/MentorEngine.ts -> src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/recommendation-engine/RecommendationEngine.ts -> src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/regret-engine/RegretEngine.ts -> src/intelligence/student-model/StudentBelief.ts`

### 6.2 Feature/Public Module -> Authority Bypass

Fresh scan found 393 direct imports from non-owned files into authority-owned intelligence files. Many are index modules that publicly re-export internal engines.

Examples:

| Non-owned entry file | Authority reached | Path |
| --- | --- | --- |
| `src/assessment/questions/index.ts` | `StudentUnderstandingAuthority` | `src/assessment/questions/index.ts -> src/assessment/questions/question-validator.ts` |
| `src/assessment/validation/index.ts` | `StudentUnderstandingAuthority` | `src/assessment/validation/index.ts -> src/assessment/validation/assessment-validator.ts` |
| `src/career-fit/index.ts` | `OptionGeneratorAuthority` | `src/career-fit/index.ts -> src/career-fit/career-fit-engine.ts` |
| `src/career-intelligence/index.ts` | `OptionGeneratorAuthority` | `src/career-intelligence/index.ts -> src/career-intelligence/career-intelligence-engine.ts` |
| `src/career-journeys/index.ts` | `OptionGeneratorAuthority` | `src/career-journeys/index.ts -> src/career-journeys/career-journey-engine.ts` |
| `src/career-reality/index.ts` | `OptionGeneratorAuthority` | `src/career-reality/index.ts -> src/career-reality/engines/career-reality-engine.ts` |
| `src/authoring/index.ts` | `OptionGeneratorAuthority` | `src/authoring/index.ts -> src/authoring/career-authoring-framework.ts -> src/ontology/career-ontology/index.ts -> src/ontology/career-ontology/CareerOntologyV2.ts` |

These are bypass paths because callers can reach authority behavior through public modules rather than through the orchestrator and owning facade.

### 6.3 Multi-Authority Public Surface Bypass

Fresh scan found two non-owned files that transitively reach more than one authority:

| File | Reached authorities |
| --- | --- |
| `src/intelligence/index.ts` | `OptionGeneratorAuthority`, `StudentUnderstandingAuthority` |
| `src/intelligence/counterfactual-engine/__tests__/CounterfactualEngine.example.ts` | `OptionGeneratorAuthority`, `StudentUnderstandingAuthority` |

The production concern is `src/intelligence/index.ts`: a broad public intelligence barrel can allow a caller to assemble cross-authority behavior without `IntelligenceOrchestrator`.

### 6.4 Student -> Authority and UI/API -> Authority Bypass

The scan did not find direct `src/app/` imports into mapped authority-owned files. However, the absence of an orchestrator means the system has no constitutional entrypoint that prevents:

- UI/API code calling public intelligence barrels.
- Workers or jobs calling authority-owned engines directly.
- Feature modules combining student, option, and outcome behavior locally.
- Tests/examples normalizing direct engine usage that production code later copies.

This is a structural bypass, not a single observed direct import count.

## 7. Duplicate Intelligence Clusters

Wave 3.3 found 12 overlapping intelligence clusters:

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

Duplicate clusters are not inherently wrong. They become violations when multiple files independently create the same authority-owned intelligence without a facade that defines ownership, lifecycle, output contracts, and audit attribution.

## 8. Boundary Audit Verdict

Current state:

- Direct authority-to-authority violation count: 4.
- Direct circular authority dependency count: 0.
- Structural shadow intelligence count: 444.
- Missing constitutional authority facade count: 4.
- Orchestrator bypass surface: present through 393 direct non-owned imports into authority-owned intelligence files and 131 non-owned files with transitive authority reach.

The repository has strong domain intelligence coverage, but constitutional boundary enforcement is not currently guaranteed because the meta-authority and the three domain authority facades are not implemented in `src/`. Current intelligence modules operate as source-level systems rather than enforceable constitutional authority members.

The enforcement architecture must therefore close three classes of paths:

1. Direct cross-authority source imports.
2. Non-owned public surfaces that expose authority internals.
3. Runtime calls to authority behavior that do not carry an orchestrator-approved request context.
