# Wave 3.3.4 - Current Architecture Map

## 1. Source Basis

This map is based on the current repository at `C:\Users\a\Projects\careeros-v2` and the constitutional documents listed for Wave 3.3.4.

Primary evidence:

- `docs/constitutional/CAREEROS_CONSTITUTION.md`
- `docs/constitutional/Wave3_3_1_IntelligenceOrchestratorBlueprint.md`
- `docs/constitutional/Wave3_3_2_AuthorityContracts.md`
- `docs/constitutional/BoundaryViolationAudit.md`
- `docs/constitutional/EnforcementArchitecture.md`
- `docs/constitutional/DependencyGovernanceModel.md`
- `docs/constitutional/ShadowIntelligenceEliminationPlan.md`
- `docs/constitutional/ConstitutionalComplianceFramework.md`
- `docs/constitutional/Wave3_3_3_FinalVerdict.md`
- `docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md`
- `docs/constitutional/Wave3_3_AuthorityInventory.md`

## 2. Repository Shape

Package evidence:

- `package.json` name: `careeros-v2`
- Runtime/app stack: Next.js, React, TypeScript
- Persistence stack: Prisma and `@prisma/client`
- Testing stack: Vitest
- UI/support dependencies: Clerk, Framer Motion, lucide-react, Zustand, Tailwind

Top-level architecture evidence:

| Area | Evidence |
| --- | --- |
| Application shell | `src/`, `public/`, `next.config.ts`, `next-env.d.ts` |
| Persistence/infrastructure | `prisma/`, `prisma.config.ts` |
| Documentation | `docs/`, `constitutional-audits/`, root architecture and audit markdown files |
| Build/test/runtime | `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs` |

## 3. Current Architectural Pattern

Current CareerOS V2 is a TypeScript modular application with a large in-repository intelligence surface.

Observed current state:

- Intelligence modules are implemented as source-level engines, calculators, analyzers, repositories, trackers, validators, and orchestrator-like local coordinators.
- Constitutional authority facades are not implemented in `src/`.
- `IntelligenceOrchestrator` is not implemented in `src/`.
- Some adjacent authority implementations exist: `DecisionAuthority`, `IDecisionAuthority`, `MetaDecisionAuthority`, `ConfidenceAuthority`, and `IConfidenceAuthority`.
- Current intelligence behavior is organized by domain folders and local engine clusters, not by enforceable constitutional authority facades.

Current architecture classification:

| Pattern | Current reality |
| --- | --- |
| Monolith | Yes, source is in one repository and one application/runtime shape |
| Modular monolith | Behaviorally yes; many domain/intelligence modules exist inside one repo |
| Microservices | No source evidence of independent deployed services for the four Wave 3 authorities |
| Layered architecture | Partial; app/source/infrastructure directories exist, but intelligence boundaries are not enforced |
| Hexagonal/clean architecture | Not currently enforceable for intelligence because authority facades are missing |
| Event-driven architecture | Partial; event concepts exist in outcome and decision systems, but cross-authority event routing is not yet orchestrator-owned |
| Constitutional architecture | Mapped in docs, not yet enforced in source |

## 4. Current Intelligence Inventory

Wave 3.3 ownership map discovered 444 intelligence implementation files.

| Authority ownership bucket | Current files | Current source facade |
| --- | ---: | --- |
| `StudentUnderstandingAuthority` | 50 | Not found in `src/` |
| `OptionGeneratorAuthority` | 339 | Not found in `src/` |
| `OutcomeTrackerAuthority` | 55 | Not found in `src/` |
| `IntelligenceOrchestrator` | 0 | Not found in `src/` |
| Total | 444 | Not constitutionally enforceable |

Top current source directories by discovered intelligence file count:

| Directory | Files |
| --- | ---: |
| `src/intelligence` | 327 |
| `src/assessment` | 12 |
| `src/outcome-tracking` | 11 |
| `src/archetype` | 11 |
| `src/career-journeys` | 9 |
| `src/ontology` | 9 |
| `src/career-reality` | 8 |
| `src/market-data-ingestion` | 6 |
| `src/career-fit` | 5 |
| `src/career-taxonomy` | 5 |
| `src/future-simulation` | 5 |
| `src/mentor-intelligence` | 5 |
| `src/optionality-intelligence` | 5 |
| `src/regret-intelligence` | 5 |
| `src/career-intelligence` | 4 |
| `src/decision-intelligence` | 4 |
| `src/recommendation` | 4 |
| `src/utility-intelligence` | 4 |
| `src/profile` | 4 |
| `src/knowledge-graph` | 1 |

## 5. Current Domains

Domains are inferred from behavior in the ownership map, not only from names.

| Domain | Current behavior | Constitutional owner |
| --- | --- | --- |
| Student assessment | Process responses, extract signals, validate assessment quality, score dimensions | `StudentUnderstandingAuthority` |
| Student profile/model | Build and update student profiles, beliefs, values, identity, growth, risk, bias, similarity | `StudentUnderstandingAuthority` |
| Archetype intelligence | Infer archetypes, evidence, stability, narratives, strengths, risks | `StudentUnderstandingAuthority` |
| Career knowledge | Maintain career taxonomy, ontology, graph, evidence, career intelligence | `OptionGeneratorAuthority` |
| Career fit/matching | Calculate fit, similarity, confidence, explanations | `OptionGeneratorAuthority` |
| Recommendations | Generate, rank, fuse, stabilize, explain recommendations | `OptionGeneratorAuthority` |
| Pathways/roadmaps | Generate journeys, transitions, milestones, path comparisons | `OptionGeneratorAuthority` |
| Future simulation | Generate scenarios, trajectories, future outcomes | `OptionGeneratorAuthority` |
| Market intelligence | Ingest signals, forecast, detect emerging/declining careers and skills, adjust options | `OptionGeneratorAuthority` |
| Decision/utility/regret/optionality | Compare options, model tradeoffs, regret, optionality, utility, real options | `OptionGeneratorAuthority`, with adjacent `DecisionAuthority` for final decision behavior |
| Mentor/guidance intelligence | Generate advice, guidance, mentor-derived lessons and patterns | `OptionGeneratorAuthority` when used for option guidance |
| Outcome tracking | Track recommendation exposures, decisions, actions, outcomes, cohorts, events | `OutcomeTrackerAuthority` |
| Feedback/learning | Process feedback, active learning, learning loops, population learning | `OutcomeTrackerAuthority` |
| Calibration/quality | Calibrate recommendations, decisions, regret, confidence, quality, reliability | `OutcomeTrackerAuthority`, with adjacent `ConfidenceAuthority` where global confidence behavior is in scope |

## 6. Current Dependency Baseline

Wave 3.3.3 source import scan found:

| Dependency metric | Count |
| --- | ---: |
| TypeScript files in `src/` | 802 |
| Intelligence files in ownership map | 444 |
| Direct imports into mapped intelligence files | 839 |
| Direct cross-authority imports | 4 |
| Direct non-owned imports into authority-owned files | 393 |
| Non-owned files with transitive authority reach | 131 |
| Non-owned files reaching multiple authorities | 2 |
| Direct circular authority dependencies | 0 |

Direct cross-authority imports:

| Importer | Importer owner | Target | Target owner |
| --- | --- | --- | --- |
| `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentModelEngine.ts` | `StudentUnderstandingAuthority` |
| `src/intelligence/mentor/MentorEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentBelief.ts` | `StudentUnderstandingAuthority` |
| `src/intelligence/recommendation-engine/RecommendationEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentBelief.ts` | `StudentUnderstandingAuthority` |
| `src/intelligence/regret-engine/RegretEngine.ts` | `OptionGeneratorAuthority` | `src/intelligence/student-model/StudentBelief.ts` | `StudentUnderstandingAuthority` |

Current dependency issue:

```text
Feature/public modules and authority-owned implementation files
  -> direct local engines
  -> local orchestration and output generation
  -> no IntelligenceOrchestrator enforcement
```

## 7. Current Shadow Architecture

Current shadow intelligence count: 444.

This does not mean all 444 files are wrong. It means they are not yet constitutionally governed by:

- A registered owner.
- A domain authority facade.
- Orchestrator-routed cross-authority workflow.
- Runtime authority context.
- Policy enforcement.
- Audit lineage.

Current shadow pattern:

```text
Caller
  -> public barrel or local engine
  -> engine-specific inputs
  -> engine output
  -> optional local synthesis
```

Missing constitutional pattern:

```text
Caller
  -> IntelligenceOrchestrator
  -> authority facade
  -> authority-owned internal engine
  -> authority output with owner/version/audit
```

## 8. Current Architecture Verdict

CareerOS V2 currently has broad and mature intelligence modules, but the current architecture is source-module organized rather than constitutionally authority-organized.

The migration must not rewrite or move these modules first. The production-safe path is:

1. Preserve the current engines.
2. Add orchestrator and authority boundaries around them.
3. Redirect traffic gradually.
4. Move ownership logically before moving files physically.
5. Eliminate shadow access paths only after parity and audit validation.
