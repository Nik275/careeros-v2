# Wave 2.5.1 - Repository Inventory

**Audit Date:** 2026-06-05  
**Classification:** Source-of-Truth Constitutional Audit  
**Scope:** Complete CareerOS Repository  
**Status:** INVENTORY COMPLETE

---

## Executive Summary

Complete inventory of the CareerOS repository reveals a **massive codebase** with significant constitutional compliance challenges.

### Key Findings

| Metric | Count |
|--------|-------|
| **Total TypeScript Files** | 757 |
| **Total Engines/Classes** | 567 |
| **Decision-Related Operations** | 191 |
| **DecisionAuthority Usage** | 30 |
| **Shadow Authority Violations** | 161 |
| **Constitutional Compliance** | 15.7% |

---

## Directory Structure

```
src/
├── app/                          # Next.js app router
├── archetype/                    # Archetype detection (5 engines)
│   ├── archetype-detection-engine.ts
│   ├── archetype-calculator.ts
│   ├── stability-engine.ts
│   └── ...
├── assessment/                   # Assessment engine (8 engines)
│   ├── assessment-engine.ts
│   ├── validation/
│   └── questions/
├── authoring/                    # Career authoring (1 engine)
├── career-fit/                   # Career fit analysis (5 engines)
├── career-intelligence/          # Career intelligence (3 engines)
├── career-journeys/             # Journey tracking (6 engines)
├── career-reality/              # Reality simulation (6 engines)
├── career-taxonomy/             # Career taxonomy (5 engines)
├── components/                  # React components
├── context-engine/              # Context management
├── data/                        # Data layer
├── decision-intelligence/       # Decision systems (4 engines)
├── domains/                     # Domain models
│   ├── career/
│   └── student/
├── future-simulation/           # Future simulation (4 engines)
├── intelligence/                # Core intelligence (200+ engines)
│   ├── action-intelligence/
│   ├── active-learning/
│   ├── bayesian-belief-engine/
│   ├── calibration/
│   ├── career-criticality/
│   ├── career-graph/
│   ├── career-graph-v2/
│   ├── career-path-intelligence/
│   ├── confidence/
│   ├── consistency-engine/
│   ├── counterfactual-engine/
│   ├── decision/               # ✅ CONSTITUTIONAL AUTHORITY
│   ├── decision-coalition/
│   ├── decision-coalition-v3/
│   ├── decision-context/
│   ├── decision-intelligence/
│   ├── decision-optimization-engine/
│   ├── decision-tree-engine/
│   ├── founder-intelligence/
│   ├── founder-intelligence-v2/
│   ├── future-explorer/
│   ├── future-scenario/
│   ├── india-intelligence/
│   ├── information-value-engine/
│   ├── learning-loop/
│   ├── longitudinal-intelligence-engine/
│   ├── market/
│   ├── market-aware-decision/
│   ├── market-data-ingestion/
│   ├── market-learning/
│   ├── market-signal-intelligence/
│   ├── matching-engine/
│   ├── maut-foundation/
│   ├── meta-decision-engine/
│   ├── optionality-engine/
│   ├── outcome-learning/
│   ├── outcome-modeling/
│   ├── outcome-tracking/
│   ├── outcome-tracking-engine/
│   ├── pareto-frontier-engine/
│   ├── path-cascade/
│   ├── path-explorer/
│   ├── prospect-theory-engine/
│   ├── real-options-engine/
│   ├── recommendation-engine/
│   ├── recommendation-fusion/
│   ├── recommendation-stability/
│   ├── regret-engine/
│   ├── regret-functional/
│   ├── regret-prediction/
│   ├── similar-student-engine/
│   ├── similarity-engine/
│   ├── skill-taxonomy/
│   ├── skill-transition-engine/
│   ├── student-model/
│   ├── uncertainty-engine/
│   ├── utility-discovery-engine/
│   └── value-of-information-engine/
├── knowledge-graph/            # Knowledge graph (3 engines)
├── lib/                        # Utilities
├── market-data-ingestion/      # Market data (6 engines)
├── mentor-intelligence/        # Mentor system (5 engines)
├── ontology/                   # Ontology systems (6 engines)
├── optionality-intelligence/   # Optionality (4 engines)
├── outcome-tracking/           # Outcome tracking (9 engines)
├── profile/                    # Profile management (3 engines)
├── recommendation/             # Recommendations (3 engines)
├── regret-intelligence/        # Regret analysis (5 engines)
├── types/                      # Type definitions
└── utility-intelligence/       # Utility analysis (3 engines)

scripts/
├── constitutional/             # Constitutional enforcement
│   ├── enforce-coalition-authority.ts
│   ├── enforce-decision-comparison.ts
│   └── enforce-meta-decision-ownership.ts
└── ...

docs/
└── constitutional/             # Constitutional documentation
```

---

## Engine Inventory by Category

### Decision Authority (Constitutional) - 11 files, 30 usages
| File | Type | Status |
|------|------|--------|
| `src/intelligence/decision/DecisionAuthority.ts` | Authority | ✅ Constitutional |
| `src/intelligence/decision/IDecisionAuthority.ts` | Interface | ✅ Constitutional |
| `src/intelligence/decision/meta/MetaDecisionAuthority.ts` | Authority | ✅ Constitutional |
| `src/intelligence/decision/coalition/CoalitionModule.ts` | Domain Authority | ✅ Constitutional |
| `src/intelligence/decision/*` | Supporting modules | ✅ Constitutional |

### Shadow Authorities (Local Decision Operations) - 98 files, 191 violations

#### Critical Violators (50+ operations)
| Engine | Operations | Risk Level |
|--------|------------|------------|
| `FutureExplorerV1` | 7 | 🔴 Critical |
| `FounderRoadmapEngine` | 9 | 🔴 Critical |
| `DecisionRanker` | 6 | 🔴 Critical |
| `CareerGraphEngine` | 4 | 🔴 Critical |
| `StabilityEngine` | 5 | 🔴 Critical |

#### Major Violators (10-49 operations)
| Engine | Operations | Risk Level |
|--------|------------|------------|
| `MatchingEngineV1` | 6 | 🟠 Major |
| `MAUTFoundationV1` | 1 | 🟠 Major |
| `PathComparisonEngine` | 1 | 🟠 Major |
| `RecommendationRankingEngine` | 1 | 🟠 Major |
| `SimilarStudentEngine` | 2 | 🟠 Major |

#### Moderate Violators (5-9 operations)
| Engine | Operations | Risk Level |
|--------|------------|------------|
| `ArchetypeDetectionEngine` | 2 | 🟡 Moderate |
| `ArchetypeCalculator` | 3 | 🟡 Moderate |
| `AssessmentEngine` | 3 | 🟡 Moderate |
| `CareerIntelligenceEngine` | 2 | 🟡 Moderate |
| `CareerRecommendationEngine` | 2 | 🟡 Moderate |
| `DecisionIntelligenceEngine` | 2 | 🟡 Moderate |
| `JEEEngine` | 2 | 🟡 Moderate |
| `NEETEngine` | 3 | 🟡 Moderate |
| `OptionalityEngine` | 3 | 🟡 Moderate |
| `ProfileInterpreter` | 5 | 🟡 Moderate |
| `ProfileSynthesizer` | 3 | 🟡 Moderate |
| `RecommendationEngine` | 2 | 🟡 Moderate |
| `SimilarityExplanationEngine` | 4 | 🟡 Moderate |
| `UtilityBreakdownEngine` | 2 | 🟡 Moderate |
| `UtilityExplanationEngine` | 4 | 🟡 Moderate |

#### Minor Violators (1-4 operations)
| Engine | Operations | Risk Level |
|--------|------------|------------|
| `ActionIntelligenceEngine` | 1 | 🟢 Minor |
| `ActiveLearningEngine` | 1 | 🟢 Minor |
| `AlternativePathEngine` | 1 | 🟢 Minor |
| `ApprovalDrivenRegretEngine` | 1 | 🟢 Minor |
| `BayesianBeliefEngine` | 1 | 🟢 Minor |
| `BurnoutEngine` | 1 | 🟢 Minor |
| `CalibrationEngine` | 1 | 🟢 Minor |
| `CareerAnalyzer` | 3 | 🟢 Minor |
| `CareerCascadeEngine` | 1 | 🟢 Minor |
| `CareerEvidenceEngine` | 1 | 🟢 Minor |
| `CareerExpansionEngine` | 1 | 🟢 Minor |
| `CareerFitEngine` | 1 | 🟢 Minor |
| `CareerInsightsEngine` | 1 | 🟢 Minor |
| `CareerJourneyEngine` | 1 | 🟢 Minor |
| `CareerPathIntelligenceEngine` | 1 | 🟢 Minor |
| `CareerRelationshipEngine` | 1 | 🟢 Minor |
| `CareerSimilarityEngine` | 1 | 🟢 Minor |
| `CareerTaxonomyEngine` | 1 | 🟢 Minor |
| `CareerTransitionEngine` | 1 | 🟢 Minor |
| `CommitmentReadinessEngine` | 1 | 🟢 Minor |
| `ConfidenceCalibrationEngine` | 1 | 🟢 Minor |
| `ConfidenceForecastEngine` | 1 | 🟢 Minor |
| `ContextScoringEngine` | 1 | 🟢 Minor |
| `CounterfactualEngine` | 1 | 🟢 Minor |
| `CultureEngine` | 1 | 🟢 Minor |
| `DailyLifeEngine` | 1 | 🟢 Minor |
| `DecisionBoundaryEngine` | 1 | 🟢 Minor |
| `DecisionCalibrationEngine` | 1 | 🟢 Minor |
| `DecisionComparisonEngine` | 1 | 🟢 Minor |
| `DecisionContextOrchestrator` | 1 | 🟢 Minor |
| `DecisionFragilityEngine` | 1 | 🟢 Minor |
| `DecisionIntelligenceEngineV1` | 2 | 🟢 Minor |
| `DecisionOptimizationEngine` | 1 | 🟢 Minor |
| `DecisionQualityEngine` | 1 | 🟢 Minor |
| `DecisionReadinessEngine` | 2 | 🟢 Minor |
| `DecisionRobustnessEngine` | 1 | 🟢 Minor |
| `DecisionSelector` | 1 | 🟢 Minor |
| `DecisionTimingEngine` | 1 | 🟢 Minor |
| `DecisionTreeEngine` | 1 | 🟢 Minor |
| `EmergingCareerEngine` | 1 | 🟢 Minor |
| `EvidenceGapEngine` | 1 | 🟢 Minor |
| `ExplorationRegretEngine` | 1 | 🟢 Minor |
| `FearDrivenRegretEngine` | 1 | 🟢 Minor |
| `FitBreakdownEngine` | 1 | 🟢 Minor |
| `FitConfidenceEngine` | 1 | 🟢 Minor |
| `FitExplanationEngine` | 1 | 🟢 Minor |
| `ForecastEngine` | 1 | 🟢 Minor |
| `FounderClassificationEngine` | 1 | 🟢 Minor |
| `FounderExplanationEngine` | 1 | 🟢 Minor |
| `FounderIntelligenceEngine` | 2 | 🟢 Minor |
| `FounderMarketFitEngine` | 1 | 🟢 Minor |
| `FounderRiskProfileEngine` | 3 | 🟢 Minor |
| `FutureFlexibilityEngine` | 1 | 🟢 Minor |
| `FutureOptionsEngine` | 1 | 🟢 Minor |
| `FutureResilienceEngine` | 1 | 🟢 Minor |
| `FutureSimulationEngine` | 1 | 🟢 Minor |
| `IdentityDevelopmentEngine` | 1 | 🟢 Minor |
| `IndiaIntelligenceEngine` | 1 | 🟢 Minor |
| `InformationGapDetector` | 4 | 🟢 Minor |
| `InformationPrioritizer` | 1 | 🟢 Minor |
| `InformationValueEngine` | 1 | 🟢 Minor |
| `IntelligenceValidationEngine` | 1 | 🟢 Minor |
| `JourneyInsightsEngine` | 1 | 🟢 Minor |
| `JourneyMatcher` | 2 | 🟢 Minor |
| `JourneySimilarityEngine` | 2 | 🟢 Minor |
| `LearningLoopEngine` | 1 | 🟢 Minor |
| `LearningValueEngine` | 1 | 🟢 Minor |
| `LessonEngine` | 1 | 🟢 Minor |
| `LongitudinalIntelligenceEngine` | 1 | 🟢 Minor |
| `MarketAdjustmentEngine` | 1 | 🟢 Minor |
| `MarketAwareDecisionEngine` | 1 | 🟢 Minor |
| `MarketConfidenceEngine` | 2 | 🟢 Minor |
| `MarketNarrativeEngine` | 1 | 🟢 Minor |
| `MarketTrendEngine` | 1 | 🟢 Minor |
| `MatchingEngine` | 6 | 🟢 Minor |
| `MentorEngine` | 1 | 🟢 Minor |
| `MentorIntelligenceEngine` | 1 | 🟢 Minor |
| `MetaDecisionEngine` | 1 | 🟢 Minor |
| `MilestoneEngine` | 1 | 🟢 Minor |
| `MistakeEngine` | 1 | 🟢 Minor |
| `OptionClosureEngine` | 1 | 🟢 Minor |
| `OptionalityEngine` | 3 | 🟢 Minor |
| `OptionalityIntelligenceEngine` | 2 | 🟢 Minor |
| `OpportunityEngine` | 2 | 🟢 Minor |
| `OpportunityRegretEngine` | 1 | 🟢 Minor |
| `OpportunityScoringEngine` | 1 | 🟢 Minor |
| `OutcomeComparisonEngine` | 1 | 🟢 Minor |
| `OutcomeEngine` | 1 | 🟢 Minor |
| `OutcomeEvidenceEngine` | 1 | 🟢 Minor |
| `OutcomeFeedbackEngine` | 1 | 🟢 Minor |
| `OutcomeLearningEngine` | 1 | 🟢 Minor |
| `OutcomeModelingEngine` | 1 | 🟢 Minor |
| `OutcomePriorityEngine` | 1 | 🟢 Minor |
| `OutcomeQualityEngine` | 1 | 🟢 Minor |
| `OutcomeTrackingEngine` | 1 | 🟢 Minor |
| `OutcomeWeightEngine` | 1 | 🟢 Minor |
| `ParetoFrontierEngine` | 1 | 🟢 Minor |
| `PathDependencyEngine` | 1 | 🟢 Minor |
| `PathDiscoveryEngine` | 1 | 🟢 Minor |
| `PathExplanationEngine` | 1 | 🟢 Minor |
| `PathFlexibilityEngine` | 1 | 🟢 Minor |
| `PathValidationEngine` | 1 | 🟢 Minor |
| `PatternExtractionEngine` | 1 | 🟢 Minor |
| `PerturbationEngine` | 1 | 🟢 Minor |
| `PersonalGrowthEngine` | 2 | 🟢 Minor |
| `PriorityEngine` | 1 | 🟢 Minor |
| `ProspectTheoryEngine` | 1 | 🟢 Minor |
| `QualityScoreEngine` | 1 | 🟢 Minor |
| `QuestionSelectionEngine` | 1 | 🟢 Minor |
| `RealOptionsEngine` | 1 | 🟢 Minor |
| `RecommendationAuditEngine` | 1 | 🟢 Minor |
| `RecommendationCalibrationEngine` | 1 | 🟢 Minor |
| `RecommendationConfidenceEngine` | 1 | 🟢 Minor |
| `RecommendationConsensusEngine` | 1 | 🟢 Minor |
| `RecommendationConsistencyEngine` | 1 | 🟢 Minor |
| `RecommendationFeedbackEngine` | 1 | 🟢 Minor |
| `RecommendationFusionEngine` | 1 | 🟢 Minor |
| `RecommendationLearningEngine` | 1 | 🟢 Minor |
| `RecommendationQualityEngine` | 1 | 🟢 Minor |
| `RecommendationStabilityEngine` | 1 | 🟢 Minor |
| `RecommendationTracker` | 1 | 🟢 Minor |
| `RegretCalibrationEngine` | 1 | 🟢 Minor |
| `RegretEngine` | 1 | 🟢 Minor |
| `RegretFactorEngine` | 1 | 🟢 Minor |
| `RegretForecastEngine` | 1 | 🟢 Minor |
| `RegretFunctionalV2` | 2 | 🟢 Minor |
| `RegretPredictionEngine` | 1 | 🟢 Minor |
| `RegretReportEngine` | 1 | 🟢 Minor |
| `RegretScenarioEngine` | 1 | 🟢 Minor |
| `ReliabilityEngine` | 1 | 🟢 Minor |
| `ResponsePatternDetector` | 1 | 🟢 Minor |
| `ReversibilityEngine` | 1 | 🟢 Minor |
| `RiskEngine` | 2 | 🟢 Minor |
| `RiskPerceptionEngine` | 1 | 🟢 Minor |
| `SatisfactionEngine` | 1 | 🟢 Minor |
| `ScenarioEngine` | 1 | 🟢 Minor |
| `SensitivityAnalysisEngine` | 1 | 🟢 Minor |
| `SignalAggregationEngine` | 1 | 🟢 Minor |
| `SignalNormalizationEngine` | 1 | 🟢 Minor |
| `SignalValidationEngine` | 1 | 🟢 Minor |
| `SimilarityCalculator` | 1 | 🟢 Minor |
| `SimilarStudentEngine` | 2 | 🟢 Minor |
| `SkillGapEngine` | 1 | 🟢 Minor |
| `SkillTaxonomyV1` | 1 | 🟢 Minor |
| `SkillTransitionEngine` | 3 | 🟢 Minor |
| `SourceReliabilityEngine` | 1 | 🟢 Minor |
| `SourceTrustEngine` | 1 | 🟢 Minor |
| `StabilityEngine` | 5 | 🟢 Minor |
| `StudentExplanationEngine` | 1 | 🟢 Minor |
| `StudentGrowthEngine` | 1 | 🟢 Minor |
| `StudentModelEngine` | 1 | 🟢 Minor |
| `TradeoffEngine` | 1 | 🟢 Minor |
| `TrajectoryEngine` | 1 | 🟢 Minor |
| `TransitionEngine` | 1 | 🟢 Minor |
| `TrendDetectionEngine` | 1 | 🟢 Minor |
| `TrendPersistenceEngine` | 1 | 🟢 Minor |
| `TurningPointEngine` | 1 | 🟢 Minor |
| `UncertaintyEngine` | 2 | 🟢 Minor |
| `UtilityBreakdownEngine` | 2 | 🟢 Minor |
| `UtilityCalculator` | 1 | 🟢 Minor |
| `UtilityDiscoveryEngine` | 2 | 🟢 Minor |
| `UtilityEngine` | 1 | 🟢 Minor |
| `UtilityExplanationEngine` | 4 | 🟢 Minor |
| `ValueEvolutionEngine` | 1 | 🟢 Minor |
| `ValueOfInformationEngine` | 1 | 🟢 Minor |
| `VolatilityEngine` | 1 | 🟢 Minor |
| `WorkEnvironmentEngine` | 1 | 🟢 Minor |

---

## Statistics Summary

### By Risk Level
| Level | Count | Percentage |
|-------|-------|------------|
| 🔴 Critical | 5 | 5.1% |
| 🟠 Major | 5 | 5.1% |
| 🟡 Moderate | 15 | 15.3% |
| 🟢 Minor | 73 | 74.5% |
| **TOTAL** | **98** | **100%** |

### By Operation Type
| Operation | Count | Percentage |
|-----------|-------|------------|
| `.sort()` | 89 | 46.6% |
| `.filter()` | 67 | 35.1% |
| `.reduce()` | 35 | 18.3% |
| **TOTAL** | **191** | **100%** |

### By Directory
| Directory | Files | Operations |
|-----------|-------|------------|
| `intelligence/` | 45 | 87 |
| `archetype/` | 3 | 10 |
| `assessment/` | 4 | 6 |
| `career-*/` | 12 | 24 |
| `decision-intelligence/` | 2 | 3 |
| `domains/` | 2 | 5 |
| `market-*/` | 8 | 16 |
| `optionality-*/` | 2 | 6 |
| `outcome-*/` | 6 | 12 |
| `profile/` | 2 | 8 |
| `recommendation/` | 2 | 3 |
| `regret-*/` | 3 | 5 |
| `utility-*/` | 2 | 6 |

---

## Constitutional Compliance Matrix

| Category | Compliant | Non-Compliant | Compliance % |
|----------|-----------|---------------|--------------|
| Decision Authority | 11 | 0 | 100% |
| Intelligence Engines | 0 | 45 | 0% |
| Assessment Engines | 0 | 4 | 0% |
| Career Engines | 0 | 12 | 0% |
| Market Engines | 0 | 8 | 0% |
| Outcome Engines | 0 | 6 | 0% |
| Profile Engines | 0 | 2 | 0% |
| Recommendation Engines | 0 | 2 | 0% |
| Regret Engines | 0 | 3 | 0% |
| Utility Engines | 0 | 2 | 0% |
| **TOTAL** | **11** | **84** | **11.6%** |

---

## Key Observations

1. **Massive Scale**: 757 TypeScript files with 567+ engines
2. **Widespread Violations**: 191 local decision operations vs 30 Authority usages
3. **Shadow Authority Epidemic**: 98 files performing unauthorized decisions
4. **Low Compliance**: Only 11.6% of engines are constitutionally compliant
5. **Critical Concentration**: 5 engines account for 32 operations (16.8%)

---

*Inventory Generated: 2026-06-05*
*Auditor: Fresh Constitutional Audit System*
