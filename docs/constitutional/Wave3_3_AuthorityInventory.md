# Wave 3.3 - Authority Inventory

**Audit Date:** 2026-06-05  
**Repository:** `C:/Users/a/Projects/careeros-v2`  
**Constitutional Source:** `docs/constitutional/CAREEROS_CONSTITUTION.md`

## Summary

Source scope: scanned the complete `src/` tree and classified implementation systems by source behavior, exported class/function names, parameters/return types, imports, and direct source consumers. UI-only `src/app` and `src/components`, tests, pure type barrels, pure model/type files, static data, and domain-only data objects were scanned but excluded from the intelligence-system count unless they contained intelligence behavior. Direct consumers are source files that import the system file.

| Authority | Files |
| --- | --- |
| StudentUnderstandingAuthority | 50 |
| OptionGeneratorAuthority | 339 |
| OutcomeTrackerAuthority | 55 |
| IntelligenceOrchestrator | 0 |
| Total | 444 |

## Existing Authority Implementations

The requested Wave 3 authorities are not implemented in `src/` as named authority files:

- `StudentUnderstandingAuthority`: not found in `src/`
- `OptionGeneratorAuthority`: not found in `src/`
- `OutcomeTrackerAuthority`: not found in `src/`
- `IntelligenceOrchestrator`: not found in `src/`

Adjacent constitutional authority files found in source:

- `src/intelligence/decision/DecisionAuthority.ts`
- `src/intelligence/decision/IDecisionAuthority.ts`
- `src/intelligence/decision/meta/MetaDecisionAuthority.ts`
- `src/intelligence/confidence/ConfidenceAuthority.ts`
- `src/intelligence/confidence/IConfidenceAuthority.ts`


## StudentUnderstandingAuthority

**Total files:** 50


### archetype (11)

- `src/archetype/archetype-calculator.ts`
- `src/archetype/archetype-confidence-engine.ts`
- `src/archetype/archetype-detection-engine.ts`
- `src/archetype/archetype-explanation-engine.ts`
- `src/archetype/archetype-insights-engine.ts`
- `src/archetype/archetype-mapper.ts`
- `src/archetype/archetype-narrative-engine.ts`
- `src/archetype/archetype-risk-engine.ts`
- `src/archetype/archetype-strength-engine.ts`
- `src/archetype/evidence-engine.ts`
- `src/archetype/stability-engine.ts`

### assessment (12)

- `src/assessment/assessment-engine.ts`
- `src/assessment/confidence-calculator.ts`
- `src/assessment/dimension-scorer.ts`
- `src/assessment/questions/question-generator.ts`
- `src/assessment/questions/question-selection-engine.ts`
- `src/assessment/questions/question-validator.ts`
- `src/assessment/signal-extractor.ts`
- `src/assessment/validation/assessment-validator.ts`
- `src/assessment/validation/consistency-engine.ts`
- `src/assessment/validation/quality-score-engine.ts`
- `src/assessment/validation/reliability-engine.ts`
- `src/assessment/validation/response-pattern-detector.ts`

### intelligence (23)

- `src/intelligence/adaptive-mentor-foundation/analysis.ts`
- `src/intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts`
- `src/intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts`
- `src/intelligence/bayesian-belief-engine/BeliefNarrativeEngine.ts`
- `src/intelligence/bayesian-belief-engine/ContradictionDetector.ts`
- `src/intelligence/bayesian-belief-engine/EvidenceWeightEngine.ts`
- `src/intelligence/bayesian-belief-engine/PosteriorCalculator.ts`
- `src/intelligence/identity-development-engine/IdentityDevelopmentEngine.ts`
- `src/intelligence/identity-development-engine/detection.ts`
- `src/intelligence/personal-growth-engine/PersonalGrowthEngine.ts`
- `src/intelligence/personal-growth-engine/analysis.ts`
- `src/intelligence/prospect-theory-engine/BiasDetectors.ts`
- `src/intelligence/prospect-theory-engine/BiasExplanationEngine.ts`
- `src/intelligence/prospect-theory-engine/BiasImpactAnalysis.ts`
- `src/intelligence/prospect-theory-engine/ProspectTheoryEngine.ts`
- `src/intelligence/similar-student-engine/SimilarStudentEngine.ts`
- `src/intelligence/similar-student-engine/calculators.ts`
- `src/intelligence/similar-student-engine/explanations.ts`
- `src/intelligence/student-model/StudentBelief.ts`
- `src/intelligence/student-model/StudentBeliefV3.ts`
- `src/intelligence/student-model/StudentModelEngine.ts`
- `src/intelligence/value-evolution-engine/ValueEvolutionEngine.ts`
- `src/intelligence/value-evolution-engine/detection.ts`

### profile (4)

- `src/profile/profile-generator.ts`
- `src/profile/profile-insights-engine.ts`
- `src/profile/profile-interpreter.ts`
- `src/profile/profile-synthesizer.ts`

## OptionGeneratorAuthority

**Total files:** 339


### career-fit (5)

- `src/career-fit/career-fit-engine.ts`
- `src/career-fit/fit-breakdown-engine.ts`
- `src/career-fit/fit-calculator.ts`
- `src/career-fit/fit-confidence-engine.ts`
- `src/career-fit/fit-explanation-engine.ts`

### career-intelligence (4)

- `src/career-intelligence/career-analyzer.ts`
- `src/career-intelligence/career-evidence-engine.ts`
- `src/career-intelligence/career-insights-engine.ts`
- `src/career-intelligence/career-intelligence-engine.ts`

### career-journeys (9)

- `src/career-journeys/career-journey-engine.ts`
- `src/career-journeys/career-transition-engine.ts`
- `src/career-journeys/journey-analyzer.ts`
- `src/career-journeys/journey-insights-engine.ts`
- `src/career-journeys/similarity/journey-matcher.ts`
- `src/career-journeys/similarity/journey-similarity-engine.ts`
- `src/career-journeys/similarity/similarity-calculator.ts`
- `src/career-journeys/similarity/similarity-explanation-engine.ts`
- `src/career-journeys/turning-point-engine.ts`

### career-reality (8)

- `src/career-reality/engines/burnout-engine.ts`
- `src/career-reality/engines/career-reality-engine.ts`
- `src/career-reality/engines/company-stage-engine.ts`
- `src/career-reality/engines/culture-engine.ts`
- `src/career-reality/engines/daily-life-engine.ts`
- `src/career-reality/engines/reality-explanation-engine.ts`
- `src/career-reality/engines/satisfaction-engine.ts`
- `src/career-reality/engines/work-environment-engine.ts`

### career-taxonomy (5)

- `src/career-taxonomy/career-graph-engine.ts`
- `src/career-taxonomy/career-relationship-engine.ts`
- `src/career-taxonomy/career-similarity-engine.ts`
- `src/career-taxonomy/career-taxonomy-engine.ts`
- `src/career-taxonomy/career-transition-engine.ts`

### decision-intelligence (4)

- `src/decision-intelligence/decision-analyzer.ts`
- `src/decision-intelligence/decision-comparison-engine.ts`
- `src/decision-intelligence/decision-confidence-engine.ts`
- `src/decision-intelligence/decision-intelligence-engine.ts`

### future-simulation (5)

- `src/future-simulation/future-simulation-engine.ts`
- `src/future-simulation/outcome-engine.ts`
- `src/future-simulation/scenario-generator.ts`
- `src/future-simulation/simulation-explainer.ts`
- `src/future-simulation/trajectory-engine.ts`

### intelligence (264)

- `src/intelligence/action-intelligence/ActionIntelligenceEngine.ts`
- `src/intelligence/action-intelligence/engines/ActionExplanationEngine.ts`
- `src/intelligence/action-intelligence/engines/ActionGenerator.ts`
- `src/intelligence/action-intelligence/engines/ExecutionPlanner.ts`
- `src/intelligence/action-intelligence/engines/OpportunityEngine.ts`
- `src/intelligence/action-intelligence/engines/PriorityEngine.ts`
- `src/intelligence/action-intelligence/engines/SkillGapEngine.ts`
- `src/intelligence/adaptive-mentor-foundation/AdaptiveMentorFoundation.ts`
- `src/intelligence/career-criticality/criticality-engine.ts`
- `src/intelligence/career-criticality/criticality-report-engine.ts`
- `src/intelligence/career-criticality/future-flexibility-engine.ts`
- `src/intelligence/career-criticality/option-closure-engine.ts`
- `src/intelligence/career-criticality/path-dependency-engine.ts`
- `src/intelligence/career-expansion-engine/CareerExpansionEngineV1.ts`
- `src/intelligence/career-graph-v2/CareerGraphV2.ts`
- `src/intelligence/career-graph/career-cascade-engine.ts`
- `src/intelligence/career-graph/career-graph-engine.ts`
- `src/intelligence/career-graph/graph-builder.ts`
- `src/intelligence/career-graph/irreversibility-engine.ts`
- `src/intelligence/career-graph/opportunity-engine.ts`
- `src/intelligence/career-graph/optionality-engine.ts`
- `src/intelligence/career-graph/path-simulator.ts`
- `src/intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts`
- `src/intelligence/career-path-intelligence/engines/AlternativePathEngine.ts`
- `src/intelligence/career-path-intelligence/engines/FailureRecoveryEngine.ts`
- `src/intelligence/career-path-intelligence/engines/MilestoneEngine.ts`
- `src/intelligence/career-path-intelligence/engines/PathComparisonEngine.ts`
- `src/intelligence/career-path-intelligence/engines/PathDiscoveryEngine.ts`
- `src/intelligence/career-path-intelligence/engines/PathExplanationEngine.ts`
- `src/intelligence/career-path-intelligence/engines/PathValidationEngine.ts`
- `src/intelligence/career-transition-graph/CareerTransitionGraphV1.ts`
- `src/intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts`
- `src/intelligence/confidence-propagation-engine/ConfidencePropagationEngineV1.ts`
- `src/intelligence/confidence/ConfidenceAggregator.ts`
- `src/intelligence/confidence/ConfidenceAuthority.ts`
- `src/intelligence/confidence/ConfidenceCalculator.ts`
- `src/intelligence/confidence/ConfidenceCalibration.ts`
- `src/intelligence/confidence/ConfidenceMonitoring.ts`
- `src/intelligence/confidence/ConfidenceTypes.ts`
- `src/intelligence/confidence/modules/ArchetypeConfidenceModule.ts`
- `src/intelligence/confidence/modules/CareerConfidenceModule.ts`
- `src/intelligence/confidence/modules/DecisionConfidenceModule.ts`
- `src/intelligence/confidence/modules/MarketConfidenceModule.ts`
- `src/intelligence/consistency-engine/ConsistencyEngine.ts`
- `src/intelligence/consistency-engine/utils.ts`
- `src/intelligence/counterfactual-engine/CareerAdapter.ts`
- `src/intelligence/counterfactual-engine/ComparisonFactories.ts`
- `src/intelligence/counterfactual-engine/CounterfactualEngine.ts`
- `src/intelligence/criticality-engine/CriticalityEngineV1.ts`
- `src/intelligence/decision-coalition-v3/DecisionCoalitionEngineV3.ts`
- `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts`
- `src/intelligence/decision-context/DecisionContextOrchestrator.ts`
- `src/intelligence/decision-context/detection/signalExtractors.ts`
- `src/intelligence/decision-context/explanation/ContextExplanationEngine.ts`
- `src/intelligence/decision-context/scoring/ContextScoringEngine.ts`
- `src/intelligence/decision-intelligence/DecisionIntelligenceEngineV1.ts`
- `src/intelligence/decision-intelligence/decision-intelligence-engine.ts`
- `src/intelligence/decision-intelligence/decision-model.ts`
- `src/intelligence/decision-intelligence/optionality-engine.ts`
- `src/intelligence/decision-intelligence/regret-engine.ts`
- `src/intelligence/decision-intelligence/reversibility-engine.ts`
- `src/intelligence/decision-intelligence/risk-engine.ts`
- `src/intelligence/decision-intelligence/scenario-engine.ts`
- `src/intelligence/decision-intelligence/tradeoff-engine.ts`
- `src/intelligence/decision-optimization-engine/DecisionOptimizationEngineV1.ts`
- `src/intelligence/decision-tree-engine/DecisionBranchAnalyzer.ts`
- `src/intelligence/decision-tree-engine/DecisionExplanationEngine.ts`
- `src/intelligence/decision-tree-engine/DecisionPathEvaluator.ts`
- `src/intelligence/decision-tree-engine/DecisionTreeEngine.ts`
- `src/intelligence/decision-tree-engine/DecisionTreeGenerator.ts`
- `src/intelligence/decision/DecisionAudit.ts`
- `src/intelligence/decision/DecisionAuthority.ts`
- `src/intelligence/decision/DecisionEvents.ts`
- `src/intelligence/decision/DecisionExplainer.ts`
- `src/intelligence/decision/DecisionHistory.ts`
- `src/intelligence/decision/DecisionRanker.ts`
- `src/intelligence/decision/DecisionSelector.ts`
- `src/intelligence/decision/IDecisionAuthority.ts`
- `src/intelligence/decision/coalition/CoalitionModule.ts`
- `src/intelligence/decision/meta/MetaDecisionAuthority.ts`
- `src/intelligence/explainability-engine/ExplainabilityEngine.ts`
- `src/intelligence/founder-intelligence-v2/DimensionScoringEngine.ts`
- `src/intelligence/founder-intelligence-v2/FalsePositiveProtectionEngine.ts`
- `src/intelligence/founder-intelligence-v2/FounderClassificationEngine.ts`
- `src/intelligence/founder-intelligence-v2/FounderExplanationEngine.ts`
- `src/intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts`
- `src/intelligence/founder-intelligence-v2/FounderMarketFitEngine.ts`
- `src/intelligence/founder-intelligence-v2/FounderRiskProfileEngine.ts`
- `src/intelligence/founder-intelligence-v2/FounderRoadmapEngine.ts`
- `src/intelligence/founder-intelligence/protection/FalsePositiveProtectionEngine.ts`
- `src/intelligence/founder-intelligence/scoring/DimensionScoringEngine.ts`
- `src/intelligence/future-explorer/FutureExplorerV1.ts`
- `src/intelligence/future-scenario/FutureScenarioGeneratorV1.ts`
- `src/intelligence/india-intelligence/IndiaExplanationEngine.ts`
- `src/intelligence/india-intelligence/IndiaIntelligenceEngine.ts`
- `src/intelligence/india-intelligence/IndiaMotivationModel.ts`
- `src/intelligence/india-intelligence/IndiaTradeoffEngine.ts`
- `src/intelligence/india-intelligence/engines/CAEngine.ts`
- `src/intelligence/india-intelligence/engines/EconomicConstraintEngine.ts`
- `src/intelligence/india-intelligence/engines/FamilyBusinessEngine.ts`
- `src/intelligence/india-intelligence/engines/JEEEngine.ts`
- `src/intelligence/india-intelligence/engines/NEETEngine.ts`
- `src/intelligence/india-intelligence/engines/RegionalConstraintEngine.ts`
- `src/intelligence/india-intelligence/engines/UPSCEngine.ts`
- `src/intelligence/information-value-engine/InformationValueEngineV1.ts`
- `src/intelligence/longitudinal-intelligence-engine/LongitudinalIntelligenceEngine.ts`
- `src/intelligence/longitudinal-intelligence-engine/analysis.ts`
- `src/intelligence/market-aware-decision/DecisionNarrativeGenerator.ts`
- `src/intelligence/market-aware-decision/MarketAdjustmentCalculator.ts`
- `src/intelligence/market-aware-decision/MarketAwareDecisionEngine.ts`
- `src/intelligence/market-aware-decision/MarketOpportunityBoost.ts`
- `src/intelligence/market-aware-decision/MarketOverrideProtection.ts`
- `src/intelligence/market-aware-decision/MarketRiskAdjustment.ts`
- `src/intelligence/market-aware-decision/RecommendationStabilityEngine.ts`
- `src/intelligence/market-learning/TrendHistoryRepository.ts`
- `src/intelligence/market-signal-intelligence/EmergingCareerDetector.ts`
- `src/intelligence/market-signal-intelligence/MarketIntelligenceEngine.ts`
- `src/intelligence/market-signal-intelligence/MarketMomentumEngine.ts`
- `src/intelligence/market-signal-intelligence/MarketNarrativeEngine.ts`
- `src/intelligence/market-signal-intelligence/MarketRiskEngine.ts`
- `src/intelligence/market-signal-intelligence/OpportunityScoringEngine.ts`
- `src/intelligence/market-signal-intelligence/TrendDetectionEngine.ts`
- `src/intelligence/market/CareerMarketProfileEngine.ts`
- `src/intelligence/market/EmergingCareerEngine.ts`
- `src/intelligence/market/MarketConfidenceEngine.ts`
- `src/intelligence/market/MarketIntelligenceEngine.ts`
- `src/intelligence/market/MarketSignalEngine.ts`
- `src/intelligence/market/MarketTrendEngine.ts`
- `src/intelligence/market/constants/MarketWeights.ts`
- `src/intelligence/market/discovery/CareerDiscoveryEngine.ts`
- `src/intelligence/market/discovery/DecliningCareerEngine.ts`
- `src/intelligence/market/discovery/DecliningSkillEngine.ts`
- `src/intelligence/market/discovery/DiscoveryConfidenceEngine.ts`
- `src/intelligence/market/discovery/DiscoveryEngine.ts`
- `src/intelligence/market/discovery/EmergingCareerEngine.ts`
- `src/intelligence/market/discovery/EmergingIndustryEngine.ts`
- `src/intelligence/market/discovery/EmergingSkillEngine.ts`
- `src/intelligence/market/discovery/IndustryDiscoveryEngine.ts`
- `src/intelligence/market/discovery/SkillDiscoveryEngine.ts`
- `src/intelligence/market/forecasting/CareerForecastEngine.ts`
- `src/intelligence/market/forecasting/ConfidenceForecastEngine.ts`
- `src/intelligence/market/forecasting/ForecastEngine.ts`
- `src/intelligence/market/forecasting/ForecastValidationEngine.ts`
- `src/intelligence/market/forecasting/IndustryForecastEngine.ts`
- `src/intelligence/market/forecasting/RegionForecastEngine.ts`
- `src/intelligence/market/forecasting/ScenarioGenerator.ts`
- `src/intelligence/market/forecasting/SkillForecastEngine.ts`
- `src/intelligence/market/integration/MarketAdjustmentEngine.ts`
- `src/intelligence/market/integration/MarketNarrativeEngine.ts`
- `src/intelligence/market/integration/MarketOpportunityBoost.ts`
- `src/intelligence/market/integration/MarketRecommendationAudit.ts`
- `src/intelligence/market/integration/MarketRiskAdjustment.ts`
- `src/intelligence/market/interfaces/MarketProvider.ts`
- `src/intelligence/market/profile/AutomationRiskEngine.ts`
- `src/intelligence/market/profile/CareerMarketProfileEngine.ts`
- `src/intelligence/market/profile/DemandScoringEngine.ts`
- `src/intelligence/market/profile/FutureResilienceEngine.ts`
- `src/intelligence/market/profile/GrowthScoringEngine.ts`
- `src/intelligence/market/profile/OpportunityScoringEngine.ts`
- `src/intelligence/market/profile/SalaryScoringEngine.ts`
- `src/intelligence/market/profile/ScarcityScoringEngine.ts`
- `src/intelligence/market/providers/Global/ILOProvider.ts`
- `src/intelligence/market/providers/Global/WEFProvider.ts`
- `src/intelligence/market/providers/Government/AICTEProvider.ts`
- `src/intelligence/market/providers/Government/MinistryLaborProvider.ts`
- `src/intelligence/market/providers/Government/NCSProvider.ts`
- `src/intelligence/market/providers/Government/NSDCProvider.ts`
- `src/intelligence/market/providers/Government/UGCProvider.ts`
- `src/intelligence/market/providers/Industry/NasscomProvider.ts`
- `src/intelligence/market/providers/Industry/StartupIndiaProvider.ts`
- `src/intelligence/market/providers/JobMarket/FounditProvider.ts`
- `src/intelligence/market/providers/JobMarket/IndeedProvider.ts`
- `src/intelligence/market/providers/JobMarket/LinkedInProvider.ts`
- `src/intelligence/market/providers/JobMarket/NaukriProvider.ts`
- `src/intelligence/market/providers/adapters/SignalAdapter.ts`
- `src/intelligence/market/providers/reliability/SourceReliabilityEngine.ts`
- `src/intelligence/market/repositories/CareerMarketRepository.ts`
- `src/intelligence/market/trends/AccelerationEngine.ts`
- `src/intelligence/market/trends/CareerTrendEngine.ts`
- `src/intelligence/market/trends/IndustryTrendEngine.ts`
- `src/intelligence/market/trends/MarketTrendEngine.ts`
- `src/intelligence/market/trends/MomentumEngine.ts`
- `src/intelligence/market/trends/RegionTrendEngine.ts`
- `src/intelligence/market/trends/SkillTrendEngine.ts`
- `src/intelligence/market/trends/TrendDetectionEngine.ts`
- `src/intelligence/market/trends/TrendPersistenceEngine.ts`
- `src/intelligence/matching-engine/MatchingEngineV1.ts`
- `src/intelligence/maut-foundation/MAUTFoundationV1.ts`
- `src/intelligence/mentor/MentorEngine.ts`
- `src/intelligence/meta-decision-engine/CommitmentReadinessEngine.ts`
- `src/intelligence/meta-decision-engine/DecisionFragilityEngine.ts`
- `src/intelligence/meta-decision-engine/DecisionQualityEngine.ts`
- `src/intelligence/meta-decision-engine/DecisionReadinessEngine.ts`
- `src/intelligence/meta-decision-engine/DecisionRobustnessEngine.ts`
- `src/intelligence/meta-decision-engine/DecisionTimingEngine.ts`
- `src/intelligence/meta-decision-engine/MetaDecisionEngine.ts`
- `src/intelligence/meta-decision-engine/MetaDecisionNarrativeEngine.ts`
- `src/intelligence/opportunity-graph/education-graph.ts`
- `src/intelligence/opportunity-graph/graph-builder.ts`
- `src/intelligence/opportunity-graph/opportunity-graph-engine.ts`
- `src/intelligence/opportunity-graph/pathway-engine.ts`
- `src/intelligence/opportunity-graph/transition-engine.ts`
- `src/intelligence/optionality-engine/OptionalityEngineV1.ts`
- `src/intelligence/pareto-frontier-engine/ParetoFrontierEngineV1.ts`
- `src/intelligence/path-cascade/CareerGraph.ts`
- `src/intelligence/path-cascade/PathCascadeEngine.ts`
- `src/intelligence/path-explorer/CareerPathExplorerV1.ts`
- `src/intelligence/real-options-engine/CommitmentCostEngine.ts`
- `src/intelligence/real-options-engine/FlexibilityCalculator.ts`
- `src/intelligence/real-options-engine/FutureOpportunityCalculator.ts`
- `src/intelligence/real-options-engine/OptionNarrativeEngine.ts`
- `src/intelligence/real-options-engine/OptionValueCalculator.ts`
- `src/intelligence/real-options-engine/RealOptionsEngine.ts`
- `src/intelligence/real-options-engine/ReversibilityCalculator.ts`
- `src/intelligence/recommendation-engine/RecommendationEngine.ts`
- `src/intelligence/recommendation-feedback-loop/RecommendationFeedbackEngine.ts`
- `src/intelligence/recommendation-feedback-loop/measurements.ts`
- `src/intelligence/recommendation-feedback-loop/signals.ts`
- `src/intelligence/recommendation-fusion/career-weight-engine.ts`
- `src/intelligence/recommendation-fusion/confidence-fusion-engine.ts`
- `src/intelligence/recommendation-fusion/contradiction-weight-engine.ts`
- `src/intelligence/recommendation-fusion/fusion-explanation-engine.ts`
- `src/intelligence/recommendation-fusion/learning-weight-engine.ts`
- `src/intelligence/recommendation-fusion/mentor-weight-engine.ts`
- `src/intelligence/recommendation-fusion/psychology-weight-engine.ts`
- `src/intelligence/recommendation-fusion/recommendation-fusion-engine.ts`
- `src/intelligence/recommendation-fusion/recommendation-ranking-engine.ts`
- `src/intelligence/recommendation-stability/confidence-engine.ts`
- `src/intelligence/recommendation-stability/perturbation-engine.ts`
- `src/intelligence/recommendation-stability/recommendation-consensus-engine.ts`
- `src/intelligence/recommendation-stability/recommendation-stability-engine.ts`
- `src/intelligence/recommendation-stability/sensitivity-analysis-engine.ts`
- `src/intelligence/recommendation-stability/stability-engine.ts`
- `src/intelligence/recommendation-stability/student-explanation-engine.ts`
- `src/intelligence/recommendation-stability/uncertainty-engine.ts`
- `src/intelligence/recommendation-stability/volatility-engine.ts`
- `src/intelligence/regret-engine/RegretEngine.ts`
- `src/intelligence/regret-functional/RegretFunctionalV2.ts`
- `src/intelligence/regret-prediction/approval-driven-regret-engine.ts`
- `src/intelligence/regret-prediction/exploration-regret-engine.ts`
- `src/intelligence/regret-prediction/fear-driven-regret-engine.ts`
- `src/intelligence/regret-prediction/identity-regret-engine.ts`
- `src/intelligence/regret-prediction/opportunity-regret-engine.ts`
- `src/intelligence/regret-prediction/regret-forecast-engine.ts`
- `src/intelligence/regret-prediction/regret-prediction-engine.ts`
- `src/intelligence/regret-prediction/regret-report-engine.ts`
- `src/intelligence/similarity-engine/CareerSimilarityEngine.ts`
- `src/intelligence/skill-taxonomy/SkillTaxonomyV1.ts`
- `src/intelligence/skill-transition-engine/SkillTransitionEngineV1.ts`
- `src/intelligence/uncertainty-engine/UncertaintyEngineV1.ts`
- `src/intelligence/utility-discovery-engine/UtilityDiscoveryEngineV1.ts`
- `src/intelligence/validation/confidence-calibration-engine.ts`
- `src/intelligence/validation/counterfactual-engine.ts`
- `src/intelligence/validation/intelligence-validation-engine.ts`
- `src/intelligence/validation/recommendation-audit-engine.ts`
- `src/intelligence/validation/recommendation-consistency-engine.ts`
- `src/intelligence/validation/recommendation-stability-engine.ts`
- `src/intelligence/validation/uncertainty-engine.ts`
- `src/intelligence/value-of-information-engine/ExperimentRecommender.ts`
- `src/intelligence/value-of-information-engine/InformationGapDetector.ts`
- `src/intelligence/value-of-information-engine/InformationPrioritizer.ts`
- `src/intelligence/value-of-information-engine/ValueOfInformationCalculator.ts`
- `src/intelligence/value-of-information-engine/ValueOfInformationEngine.ts`
- `src/intelligence/value-of-information-engine/VoIExplanationEngine.ts`

### knowledge-graph (1)

- `src/knowledge-graph/KnowledgeGraphExplorer.ts`

### market-data-ingestion (6)

- `src/market-data-ingestion/FreshnessEngine.ts`
- `src/market-data-ingestion/MarketIngestionPipeline.ts`
- `src/market-data-ingestion/SignalAggregationEngine.ts`
- `src/market-data-ingestion/SignalNormalizationEngine.ts`
- `src/market-data-ingestion/SignalValidationEngine.ts`
- `src/market-data-ingestion/SourceTrustEngine.ts`

### mentor-intelligence (5)

- `src/mentor-intelligence/decision-outcome-engine.ts`
- `src/mentor-intelligence/lesson-engine.ts`
- `src/mentor-intelligence/mentor-intelligence-engine.ts`
- `src/mentor-intelligence/mistake-engine.ts`
- `src/mentor-intelligence/pattern-extraction-engine.ts`

### ontology (5)

- `src/ontology/career-evidence/CareerEvidenceSystem.ts`
- `src/ontology/career-ontology/CareerOntologyV2.ts`
- `src/ontology/career-relationships/CareerRelationshipTaxonomy.ts`
- `src/ontology/indian-market-intelligence/calculators.ts`
- `src/ontology/indian-market-intelligence/repositories.ts`

### optionality-intelligence (5)

- `src/optionality-intelligence/future-options-engine.ts`
- `src/optionality-intelligence/optionality-calculator.ts`
- `src/optionality-intelligence/optionality-engine.ts`
- `src/optionality-intelligence/optionality-explanation-engine.ts`
- `src/optionality-intelligence/path-flexibility-engine.ts`

### recommendation (4)

- `src/recommendation/career-recommendation-engine.ts`
- `src/recommendation/recommendation-confidence-engine.ts`
- `src/recommendation/recommendation-explainer.ts`
- `src/recommendation/recommendation-ranker.ts`

### regret-intelligence (5)

- `src/regret-intelligence/regret-calculator.ts`
- `src/regret-intelligence/regret-engine.ts`
- `src/regret-intelligence/regret-explanation-engine.ts`
- `src/regret-intelligence/regret-factor-engine.ts`
- `src/regret-intelligence/regret-scenario-engine.ts`

### utility-intelligence (4)

- `src/utility-intelligence/utility-breakdown-engine.ts`
- `src/utility-intelligence/utility-calculator.ts`
- `src/utility-intelligence/utility-engine.ts`
- `src/utility-intelligence/utility-explanation-engine.ts`

## OutcomeTrackerAuthority

**Total files:** 55


### intelligence (40)

- `src/intelligence/active-learning/active-learning-engine.ts`
- `src/intelligence/active-learning/decision-boundary-engine.ts`
- `src/intelligence/active-learning/evidence-gap-engine.ts`
- `src/intelligence/active-learning/learning-value-engine.ts`
- `src/intelligence/active-learning/outcome-priority-engine.ts`
- `src/intelligence/active-learning/uncertainty-engine.ts`
- `src/intelligence/calibration/calibration-engine.ts`
- `src/intelligence/calibration/calibration-report-engine.ts`
- `src/intelligence/calibration/confidence-calibration-engine.ts`
- `src/intelligence/calibration/criticality-calibration-engine.ts`
- `src/intelligence/calibration/decision-calibration-engine.ts`
- `src/intelligence/calibration/recommendation-calibration-engine.ts`
- `src/intelligence/calibration/regret-calibration-engine.ts`
- `src/intelligence/calibration/reliability-engine.ts`
- `src/intelligence/learning-loop/confidence-adjustment-engine.ts`
- `src/intelligence/learning-loop/learning-loop-engine.ts`
- `src/intelligence/learning-loop/outcome-feedback-engine.ts`
- `src/intelligence/learning-loop/population-learning-engine.ts`
- `src/intelligence/learning-loop/recommendation-learning-engine.ts`
- `src/intelligence/outcome-evidence-engine/OutcomeEvidenceEngine.ts`
- `src/intelligence/outcome-evidence-engine/analysis.ts`
- `src/intelligence/outcome-evidence-engine/explanations.ts`
- `src/intelligence/outcome-learning/confidence-calibration-engine.ts`
- `src/intelligence/outcome-learning/decision-learning-engine.ts`
- `src/intelligence/outcome-learning/feedback-ingestion-engine.ts`
- `src/intelligence/outcome-learning/learning-report-engine.ts`
- `src/intelligence/outcome-learning/learning-signal-engine.ts`
- `src/intelligence/outcome-learning/outcome-learning-engine.ts`
- `src/intelligence/outcome-learning/outcome-weight-engine.ts`
- `src/intelligence/outcome-learning/recommendation-learning-engine.ts`
- `src/intelligence/outcome-modeling/OutcomeModelingEngine.ts`
- `src/intelligence/outcome-tracking-engine/OutcomeTrackingEngineV1.ts`
- `src/intelligence/outcome-tracking/outcome-comparison-engine.ts`
- `src/intelligence/outcome-tracking/outcome-event-engine.ts`
- `src/intelligence/outcome-tracking/outcome-quality-engine.ts`
- `src/intelligence/outcome-tracking/outcome-store.ts`
- `src/intelligence/outcome-tracking/outcome-timeline-engine.ts`
- `src/intelligence/outcome-tracking/outcome-tracker.ts`
- `src/intelligence/outcome-tracking/outcome-tracking-engine.ts`
- `src/intelligence/outcome-tracking/student-growth-engine.ts`

### ontology (4)

- `src/ontology/outcome-ontology/OutcomeDimension.ts`
- `src/ontology/outcome-ontology/OutcomeScoringFramework.ts`
- `src/ontology/outcome-ontology/builders.ts`
- `src/ontology/outcome-ontology/validators.ts`

### outcome-tracking (11)

- `src/outcome-tracking/engines/action-tracker.ts`
- `src/outcome-tracking/engines/cohort-engine.ts`
- `src/outcome-tracking/engines/confidence-calibration-engine.ts`
- `src/outcome-tracking/engines/decision-tracker.ts`
- `src/outcome-tracking/engines/feedback-engine.ts`
- `src/outcome-tracking/engines/learning-engine.ts`
- `src/outcome-tracking/engines/outcome-tracker.ts`
- `src/outcome-tracking/engines/outcome-tracking-engine.ts`
- `src/outcome-tracking/engines/privacy-aggregation-engine.ts`
- `src/outcome-tracking/engines/recommendation-quality-engine.ts`
- `src/outcome-tracking/engines/recommendation-tracker.ts`

## IntelligenceOrchestrator

**Total files:** 0

No source file currently implements this authority or is behaviorally assigned to it.

