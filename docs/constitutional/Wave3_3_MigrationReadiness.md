# Wave 3.3 - Migration Readiness

**Audit Date:** 2026-06-05  
**Repository:** `C:/Users/a/Projects/careeros-v2`  
**Constitutional Source:** `docs/constitutional/CAREEROS_CONSTITUTION.md`

## Scoring Method

Migration difficulty is estimated from direct source evidence:

- File size in lines.
- Direct source dependency count.
- Direct source consumer count.
- Number of locally instantiated sub-engines.
- Whether the file is a local orchestrator, pipeline, fusion, or aggregate engine.

Bands:

- **Quick Win:** low dependency/consumer count, smaller file, little/no local orchestration.
- **Medium Complexity:** moderate dependencies, moderate size, or some local orchestration.
- **High Risk:** high dependency count, high local orchestration, large file, or high fan-in/fan-out.

## Authority Readiness Summary

| Authority | Current file count | Dependency count | Consumer count | Quick wins | Medium complexity | High risk | Average difficulty score | Risk level |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OptionGeneratorAuthority | 339 | 805 | 269 | 19 | 216 | 104 | 9.2 | High |
| OutcomeTrackerAuthority | 55 | 143 | 32 | 3 | 27 | 25 | 10.6 | Medium-High |
| StudentUnderstandingAuthority | 50 | 110 | 30 | 3 | 31 | 16 | 9.6 | Medium-High |

## IntelligenceOrchestrator Readiness

No implementation file currently exists for `IntelligenceOrchestrator`. Migration readiness is therefore **critical missing foundation** rather than a file-count migration. The orchestrator scope is cross-authority coordination, conflict resolution, synthesis, routing, and learning-signal distribution.

## High Risk Areas

| File | Authority | Score | Lines | Dependencies | Consumers | Local engines | Purpose |
| --- | --- | --- | --- | --- | --- | --- | --- |
| src/outcome-tracking/engines/outcome-tracking-engine.ts | OutcomeTrackerAuthority | 49 | 742 | 16 | 0 | 10 | Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning. |
| src/intelligence/market/trends/MarketTrendEngine.ts | OptionGeneratorAuthority | 43 | 846 | 12 | 0 | 9 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/MarketIntelligenceEngine.ts | OptionGeneratorAuthority | 36 | 658 | 15 | 0 | 6 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/recommendation-fusion/recommendation-fusion-engine.ts | OptionGeneratorAuthority | 36 | 696 | 9 | 0 | 8 | Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation. |
| src/career-reality/engines/career-reality-engine.ts | OptionGeneratorAuthority | 35 | 586 | 8 | 0 | 8 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/meta-decision-engine/MetaDecisionEngine.ts | OptionGeneratorAuthority | 35 | 403 | 9 | 0 | 8 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/intelligence/prospect-theory-engine/ProspectTheoryEngine.ts | StudentUnderstandingAuthority | 32 | 436 | 3 | 0 | 9 | Student values, identity, growth, risk, or bias understanding. |
| src/intelligence/market-signal-intelligence/MarketIntelligenceEngine.ts | OptionGeneratorAuthority | 31 | 705 | 7 | 0 | 7 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/real-options-engine/RealOptionsEngine.ts | OptionGeneratorAuthority | 30 | 552 | 6 | 0 | 7 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/calibration/calibration-engine.ts | OutcomeTrackerAuthority | 29 | 680 | 8 | 0 | 6 | Calibration of predictions, decisions, recommendations, regret, criticality, or confidence. |
| src/intelligence/career-graph/career-graph-engine.ts | OptionGeneratorAuthority | 28 | 593 | 7 | 0 | 6 | Career knowledge, evidence, taxonomy, graph, or ontology used by option generation. |
| src/intelligence/market-aware-decision/MarketAwareDecisionEngine.ts | OptionGeneratorAuthority | 28 | 503 | 7 | 0 | 6 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/validation/intelligence-validation-engine.ts | OptionGeneratorAuthority | 28 | 711 | 7 | 0 | 6 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/mentor-intelligence/mentor-intelligence-engine.ts | OptionGeneratorAuthority | 28 | 1315 | 7 | 0 | 5 | Mentor-derived guidance, lessons, mistakes, or pattern extraction for options. |
| src/career-journeys/career-journey-engine.ts | OptionGeneratorAuthority | 25 | 839 | 6 | 0 | 5 | Career pathway, journey, roadmap, milestone, transition, or route generation. |
| src/intelligence/active-learning/active-learning-engine.ts | OutcomeTrackerAuthority | 25 | 675 | 7 | 0 | 5 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts | StudentUnderstandingAuthority | 25 | 375 | 5 | 0 | 6 | Student knowledge creation or refinement. |
| src/intelligence/prospect-theory-engine/BiasDetectors.ts | StudentUnderstandingAuthority | 25 | 567 | 0 | 1 | 7 | Student values, identity, growth, risk, or bias understanding. |
| src/career-fit/career-fit-engine.ts | OptionGeneratorAuthority | 24 | 348 | 7 | 0 | 5 | Career fit, matching, or career similarity scoring. |
| src/career-taxonomy/career-taxonomy-engine.ts | OptionGeneratorAuthority | 24 | 559 | 6 | 0 | 5 | Career knowledge, evidence, taxonomy, graph, or ontology used by option generation. |
| src/market-data-ingestion/MarketIngestionPipeline.ts | OptionGeneratorAuthority | 24 | 554 | 6 | 0 | 5 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/outcome-learning/recommendation-learning-engine.ts | OutcomeTrackerAuthority | 23 | 655 | 2 | 0 | 6 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/intelligence/outcome-tracking/outcome-tracking-engine.ts | OutcomeTrackerAuthority | 23 | 736 | 11 | 0 | 3 | Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning. |
| src/intelligence/outcome-learning/learning-report-engine.ts | OutcomeTrackerAuthority | 22 | 542 | 1 | 0 | 6 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/assessment/validation/assessment-validator.ts | StudentUnderstandingAuthority | 22 | 476 | 5 | 0 | 5 | Assessment or validation behavior that transforms responses/questions into student understanding. |
| src/recommendation/career-recommendation-engine.ts | OptionGeneratorAuthority | 21 | 485 | 7 | 0 | 4 | Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation. |
| src/intelligence/learning-loop/learning-loop-engine.ts | OutcomeTrackerAuthority | 21 | 849 | 5 | 0 | 4 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/career-journeys/similarity/journey-similarity-engine.ts | OptionGeneratorAuthority | 20 | 710 | 5 | 0 | 4 | Career pathway, journey, roadmap, milestone, transition, or route generation. |
| src/intelligence/counterfactual-engine/CounterfactualEngine.ts | OptionGeneratorAuthority | 19 | 2249 | 5 | 2 | 1 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/career-intelligence/career-intelligence-engine.ts | OptionGeneratorAuthority | 18 | 368 | 4 | 0 | 4 | Career knowledge, evidence, taxonomy, graph, or ontology used by option generation. |
| src/intelligence/decision/DecisionAuthority.ts | OptionGeneratorAuthority | 18 | 1088 | 12 | 1 | 0 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/profile/profile-generator.ts | StudentUnderstandingAuthority | 18 | 181 | 5 | 0 | 4 | Profile interpretation, synthesis, generation, or insight behavior. |
| src/intelligence/market/discovery/DiscoveryEngine.ts | OptionGeneratorAuthority | 17 | 486 | 12 | 0 | 1 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/profile/CareerMarketProfileEngine.ts | OptionGeneratorAuthority | 17 | 722 | 11 | 0 | 1 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/recommendation-stability/recommendation-stability-engine.ts | OptionGeneratorAuthority | 17 | 538 | 11 | 0 | 1 | Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation. |
| src/intelligence/india-intelligence/IndiaIntelligenceEngine.ts | OptionGeneratorAuthority | 16 | 660 | 10 | 0 | 1 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/career-expansion-engine/CareerExpansionEngineV1.ts | OptionGeneratorAuthority | 15 | 2234 | 3 | 0 | 1 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/confidence/ConfidenceTypes.ts | OptionGeneratorAuthority | 15 | 502 | 0 | 12 | 0 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/decision-coalition-v3/DecisionCoalitionEngineV3.ts | OptionGeneratorAuthority | 15 | 1514 | 5 | 0 | 1 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/intelligence/decision-intelligence/decision-intelligence-engine.ts | OptionGeneratorAuthority | 15 | 802 | 8 | 0 | 1 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/ontology/indian-market-intelligence/repositories.ts | OptionGeneratorAuthority | 15 | 862 | 2 | 0 | 3 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/outcome-modeling/OutcomeModelingEngine.ts | OutcomeTrackerAuthority | 15 | 1501 | 5 | 0 | 1 | Outcome tracking, feedback processing, learning, calibration, or performance evaluation. |
| src/decision-intelligence/decision-analyzer.ts | OptionGeneratorAuthority | 14 | 1423 | 4 | 1 | 1 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/intelligence/decision-optimization-engine/DecisionOptimizationEngineV1.ts | OptionGeneratorAuthority | 14 | 1150 | 6 | 0 | 1 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/knowledge-graph/KnowledgeGraphExplorer.ts | OptionGeneratorAuthority | 14 | 1523 | 4 | 0 | 1 | Career knowledge, evidence, taxonomy, graph, or ontology used by option generation. |
| src/intelligence/future-explorer/FutureExplorerV1.ts | OptionGeneratorAuthority | 13 | 1744 | 6 | 0 | 0 | Future scenario, trajectory, or simulation generation. |
| src/intelligence/future-scenario/FutureScenarioGeneratorV1.ts | OptionGeneratorAuthority | 13 | 1227 | 5 | 0 | 1 | Future scenario, trajectory, or simulation generation. |
| src/intelligence/regret-functional/RegretFunctionalV2.ts | OptionGeneratorAuthority | 13 | 1532 | 6 | 0 | 0 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/utility-intelligence/utility-calculator.ts | OptionGeneratorAuthority | 13 | 1095 | 4 | 1 | 1 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/decision-coalition/DecisionCoalitionEngine.ts | OptionGeneratorAuthority | 12 | 1569 | 2 | 0 | 1 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |

## Medium Complexity Areas

Top medium-complexity files by score:

| File | Authority | Score | Purpose |
| --- | --- | --- | --- |
| src/intelligence/opportunity-graph/opportunity-graph-engine.ts | OptionGeneratorAuthority | 17 | Career knowledge, evidence, taxonomy, graph, or ontology used by option generation. |
| src/intelligence/outcome-learning/decision-learning-engine.ts | OutcomeTrackerAuthority | 17 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/intelligence/outcome-learning/confidence-calibration-engine.ts | OutcomeTrackerAuthority | 16 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/intelligence/outcome-learning/outcome-weight-engine.ts | OutcomeTrackerAuthority | 16 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/ontology/outcome-ontology/builders.ts | OutcomeTrackerAuthority | 16 | Outcome dimension/metric/scoring behavior for learning and evaluation. |
| src/intelligence/confidence/ConfidenceAuthority.ts | OptionGeneratorAuthority | 15 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/regret-intelligence/regret-engine.ts | OptionGeneratorAuthority | 15 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/market/CareerMarketProfileEngine.ts | OptionGeneratorAuthority | 14 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/discovery/DiscoveryConfidenceEngine.ts | OptionGeneratorAuthority | 14 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/regret-prediction/regret-prediction-engine.ts | OptionGeneratorAuthority | 14 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/outcome-learning/outcome-learning-engine.ts | OutcomeTrackerAuthority | 14 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/intelligence/action-intelligence/ActionIntelligenceEngine.ts | OptionGeneratorAuthority | 13 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts | OptionGeneratorAuthority | 13 | Career pathway, journey, roadmap, milestone, transition, or route generation. |
| src/intelligence/market/discovery/EmergingCareerEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/discovery/EmergingIndustryEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/discovery/EmergingSkillEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/forecasting/CareerForecastEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/forecasting/IndustryForecastEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/forecasting/RegionForecastEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/forecasting/SkillForecastEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/MarketConfidenceEngine.ts | OptionGeneratorAuthority | 13 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/optionality-intelligence/optionality-engine.ts | OptionGeneratorAuthority | 13 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/outcome-learning/learning-signal-engine.ts | OutcomeTrackerAuthority | 13 | Learning loop or active learning behavior from feedback, uncertainty, or outcomes. |
| src/archetype/archetype-explanation-engine.ts | StudentUnderstandingAuthority | 13 | Archetype inference, scoring, evidence, stability, insight, or explanation behavior. |
| src/decision-intelligence/decision-confidence-engine.ts | OptionGeneratorAuthority | 12 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/decision-intelligence/decision-intelligence-engine.ts | OptionGeneratorAuthority | 12 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/future-simulation/future-simulation-engine.ts | OptionGeneratorAuthority | 12 | Future scenario, trajectory, or simulation generation. |
| src/intelligence/decision-context/DecisionContextOrchestrator.ts | OptionGeneratorAuthority | 12 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts | OptionGeneratorAuthority | 12 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/market/EmergingCareerEngine.ts | OptionGeneratorAuthority | 12 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/forecasting/ForecastEngine.ts | OptionGeneratorAuthority | 12 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/utility-intelligence/utility-engine.ts | OptionGeneratorAuthority | 12 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/archetype/archetype-confidence-engine.ts | StudentUnderstandingAuthority | 12 | Archetype inference, scoring, evidence, stability, insight, or explanation behavior. |
| src/intelligence/career-criticality/criticality-engine.ts | OptionGeneratorAuthority | 11 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/market/discovery/CareerDiscoveryEngine.ts | OptionGeneratorAuthority | 11 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/discovery/IndustryDiscoveryEngine.ts | OptionGeneratorAuthority | 11 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/discovery/SkillDiscoveryEngine.ts | OptionGeneratorAuthority | 11 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/forecasting/ConfidenceForecastEngine.ts | OptionGeneratorAuthority | 11 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/forecasting/ScenarioGenerator.ts | OptionGeneratorAuthority | 11 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/MarketTrendEngine.ts | OptionGeneratorAuthority | 11 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/trends/CareerTrendEngine.ts | OptionGeneratorAuthority | 11 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/recommendation-feedback-loop/RecommendationFeedbackEngine.ts | OptionGeneratorAuthority | 11 | Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation. |
| src/utility-intelligence/utility-breakdown-engine.ts | OptionGeneratorAuthority | 11 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/career-fit/fit-calculator.ts | OptionGeneratorAuthority | 10 | Career fit, matching, or career similarity scoring. |
| src/career-fit/fit-confidence-engine.ts | OptionGeneratorAuthority | 10 | Career fit, matching, or career similarity scoring. |
| src/intelligence/adaptive-mentor-foundation/AdaptiveMentorFoundation.ts | OptionGeneratorAuthority | 10 | Mentor-derived guidance, lessons, mistakes, or pattern extraction for options. |
| src/intelligence/market/discovery/DecliningCareerEngine.ts | OptionGeneratorAuthority | 10 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/profile/OpportunityScoringEngine.ts | OptionGeneratorAuthority | 10 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/trends/IndustryTrendEngine.ts | OptionGeneratorAuthority | 10 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/trends/RegionTrendEngine.ts | OptionGeneratorAuthority | 10 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/value-of-information-engine/ValueOfInformationEngine.ts | OptionGeneratorAuthority | 10 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/recommendation/recommendation-confidence-engine.ts | OptionGeneratorAuthority | 10 | Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation. |
| src/assessment/assessment-engine.ts | StudentUnderstandingAuthority | 10 | Assessment or validation behavior that transforms responses/questions into student understanding. |
| src/intelligence/similar-student-engine/SimilarStudentEngine.ts | StudentUnderstandingAuthority | 10 | Student similarity or peer-profile understanding. |
| src/career-reality/engines/work-environment-engine.ts | OptionGeneratorAuthority | 9 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/future-simulation/outcome-engine.ts | OptionGeneratorAuthority | 9 | Future scenario, trajectory, or simulation generation. |
| src/intelligence/counterfactual-engine/CareerAdapter.ts | OptionGeneratorAuthority | 9 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/counterfactual-engine/ComparisonFactories.ts | OptionGeneratorAuthority | 9 | Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information. |
| src/intelligence/decision-intelligence/regret-engine.ts | OptionGeneratorAuthority | 9 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/intelligence/decision-intelligence/scenario-engine.ts | OptionGeneratorAuthority | 9 | Future scenario, trajectory, or simulation generation. |

## Quick Wins

Lowest-complexity files by score:

| File | Authority | Score | Purpose |
| --- | --- | --- | --- |
| src/intelligence/consistency-engine/utils.ts | OptionGeneratorAuthority | 2 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/market/integration/MarketOpportunityBoost.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/Global/ILOProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/Global/WEFProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/Government/AICTEProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/Government/MinistryLaborProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/Government/UGCProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/Industry/StartupIndiaProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/JobMarket/FounditProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/JobMarket/IndeedProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/JobMarket/LinkedInProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/market/providers/JobMarket/NaukriProvider.ts | OptionGeneratorAuthority | 2 | Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options. |
| src/intelligence/confidence/modules/ArchetypeConfidenceModule.ts | OptionGeneratorAuthority | 3 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/confidence/modules/DecisionConfidenceModule.ts | OptionGeneratorAuthority | 3 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/confidence/modules/MarketConfidenceModule.ts | OptionGeneratorAuthority | 3 | Option generation, scoring, validation, comparison, simulation, explanation, or guidance. |
| src/intelligence/decision/DecisionAudit.ts | OptionGeneratorAuthority | 3 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/intelligence/decision/DecisionEvents.ts | OptionGeneratorAuthority | 3 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/intelligence/decision/DecisionHistory.ts | OptionGeneratorAuthority | 3 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/outcome-tracking/engines/action-tracker.ts | OutcomeTrackerAuthority | 3 | Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning. |
| src/outcome-tracking/engines/decision-tracker.ts | OutcomeTrackerAuthority | 3 | Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning. |
| src/outcome-tracking/engines/recommendation-tracker.ts | OutcomeTrackerAuthority | 3 | Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning. |
| src/assessment/signal-extractor.ts | StudentUnderstandingAuthority | 3 | Assessment or validation behavior that transforms responses/questions into student understanding. |
| src/intelligence/meta-decision-engine/MetaDecisionNarrativeEngine.ts | OptionGeneratorAuthority | 5 | Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options. |
| src/assessment/dimension-scorer.ts | StudentUnderstandingAuthority | 6 | Assessment or validation behavior that transforms responses/questions into student understanding. |
| src/assessment/confidence-calculator.ts | StudentUnderstandingAuthority | 7 | Assessment or validation behavior that transforms responses/questions into student understanding. |

## Real Migration Scope

| Scope item | Count |
| --- | --- |
| Discovered intelligence implementation files | 444 |
| StudentUnderstandingAuthority-owned files | 50 |
| OptionGeneratorAuthority-owned files | 339 |
| OutcomeTrackerAuthority-owned files | 55 |
| Current IntelligenceOrchestrator files | 0 |
| Direct cross-authority imports | 4 |
| Direct circular authority dependencies | 0 |
| Duplicate/overlap clusters | 12 |
