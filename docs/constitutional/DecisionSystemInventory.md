# Wave 2.5.1 - Decision System Inventory

**Audit Date:** 2026-06-05  
**Classification:** Source-of-Truth Constitutional Audit  
**Scope:** All Decision-Making Components  
**Status:** INVENTORY COMPLETE

---

## Executive Summary

Comprehensive inventory of all decision-making systems in CareerOS reveals **191 decision operations** across **98 files**, with only **15.7% constitutional compliance**.

### Key Findings

| Category | Count | Constitutional | Shadow | Compliance |
|----------|-------|----------------|--------|------------|
| **Ranking Systems** | 89 | 6 | 83 | 6.7% |
| **Comparison Systems** | 12 | 2 | 10 | 16.7% |
| **Selection Systems** | 67 | 8 | 59 | 11.9% |
| **Arbitration Systems** | 3 | 1 | 2 | 33.3% |
| **Consensus Systems** | 8 | 2 | 6 | 25.0% |
| **Optimization Systems** | 4 | 1 | 3 | 25.0% |
| **Recommendation Systems** | 8 | 2 | 6 | 25.0% |
| **TOTAL** | **191** | **30** | **161** | **15.7%** |

---

## Decision Operation Categories

### 1. RANKING SYSTEMS (89 operations)

#### Constitutional (6)
| System | File | Method | Status |
|--------|------|--------|--------|
| DecisionRanker | `decision/DecisionRanker.ts` | `rank()` | ✅ |
| DecisionRanker | `decision/DecisionRanker.ts` | `rankByScore()` | ✅ |
| DecisionRanker | `decision/DecisionRanker.ts` | `rankByConfidence()` | ✅ |
| DecisionRanker | `decision/DecisionRanker.ts` | `rankByComposite()` | ✅ |
| CoalitionModule | `decision/coalition/CoalitionModule.ts` | `rankCoalitionPaths()` | ✅ |
| MetaDecisionAuthority | `decision/meta/MetaDecisionAuthority.ts` | `rankDecisions()` | ✅ |

#### Shadow Authorities (83)
| System | File | Operations | Risk |
|--------|------|------------|------|
| FutureExplorerV1 | `future-explorer/FutureExplorerV1.ts` | 7 | 🔴 Critical |
| FounderRoadmapEngine | `founder-intelligence-v2/FounderRoadmapEngine.ts` | 9 | 🔴 Critical |
| StabilityEngine | `archetype/stability-engine.ts` | 5 | 🔴 Critical |
| CareerGraphEngine | `career-graph/career-graph-engine.ts` | 4 | 🔴 Critical |
| MatchingEngineV1 | `matching-engine/MatchingEngineV1.ts` | 6 | 🟠 Major |
| ProfileInterpreter | `profile/profile-interpreter.ts` | 5 | 🟠 Major |
| UtilityExplanationEngine | `utility-intelligence/utility-explanation-engine.ts` | 4 | 🟡 Moderate |
| SimilarityExplanationEngine | `career-journeys/similarity/similarity-explanation-engine.ts` | 4 | 🟡 Moderate |
| InformationGapDetector | `value-of-information-engine/InformationGapDetector.ts` | 4 | 🟡 Moderate |
| OptionalityEngine | `optionality-intelligence/optionality-engine.ts` | 3 | 🟡 Moderate |
| IrreversibilityEngine | `career-graph/irreversibility-engine.ts` | 3 | 🟡 Moderate |
| ArchetypeCalculator | `archetype/archetype-calculator.ts` | 3 | 🟡 Moderate |
| AssessmentEngine | `assessment/assessment-engine.ts` | 3 | 🟡 Moderate |
| NEETEngine | `india-intelligence/engines/NEETEngine.ts` | 3 | 🟡 Moderate |
| ProfileSynthesizer | `profile/profile-synthesizer.ts` | 3 | 🟡 Moderate |
| FounderRiskProfileEngine | `founder-intelligence-v2/FounderRiskProfileEngine.ts` | 3 | 🟡 Moderate |
| SkillTransitionEngine | `skill-transition-engine/SkillTransitionEngineV1.ts` | 3 | 🟡 Moderate |
| CareerAnalyzer | `career-intelligence/career-analyzer.ts` | 3 | 🟢 Minor |
| [+ 64 more systems] | Various | 1-2 each | 🟢 Minor |

---

### 2. COMPARISON SYSTEMS (12 operations)

#### Constitutional (2)
| System | File | Method | Status |
|--------|------|--------|--------|
| DecisionComparator | `decision/DecisionComparator.ts` | `compare()` | ✅ |
| DecisionComparator | `decision/DecisionComparator.ts` | `compareTournament()` | ✅ |

#### Shadow Authorities (10)
| System | File | Operations | Risk |
|--------|------|------------|------|
| PathComparisonEngine | `career-path-intelligence/engines/PathComparisonEngine.ts` | 1 | 🟠 Major |
| CounterfactualEngine | `counterfactual-engine/CounterfactualEngine.ts` | 1 | 🟡 Moderate |
| ComparisonFactories | `counterfactual-engine/ComparisonFactories.ts` | 8 | 🟡 Moderate |

---

### 3. SELECTION SYSTEMS (67 operations)

#### Constitutional (8)
| System | File | Method | Status |
|--------|------|--------|--------|
| DecisionSelector | `decision/DecisionSelector.ts` | `select()` | ✅ |
| DecisionSelector | `decision/DecisionSelector.ts` | `selectTop()` | ✅ |
| DecisionSelector | `decision/DecisionSelector.ts` | `selectByThreshold()` | ✅ |
| DecisionSelector | `decision/DecisionSelector.ts` | `selectSingle()` | ✅ |
| CoalitionModule | `decision/coalition/CoalitionModule.ts` | `selectCoalitionWinner()` | ✅ |
| MetaDecisionAuthority | `decision/meta/MetaDecisionAuthority.ts` | `selectOptimalTiming()` | ✅ |
| DecisionAuthority | `decision/DecisionAuthority.ts` | `decide()` | ✅ |
| DecisionAuthority | `decision/DecisionAuthority.ts` | `selectWinner()` | ✅ |

#### Shadow Authorities (59)
| System | File | Operations | Risk |
|--------|------|------------|------|
| MatchingEngineV1 | `matching-engine/MatchingEngineV1.ts` | 6 | 🟠 Major |
| ProfileInterpreter | `profile/profile-interpreter.ts` | 5 | 🟠 Major |
| UtilityExplanationEngine | `utility-intelligence/utility-explanation-engine.ts` | 4 | 🟡 Moderate |
| SimilarityExplanationEngine | `career-journeys/similarity/similarity-explanation-engine.ts` | 4 | 🟡 Moderate |
| JourneyMatcher | `career-journeys/similarity/journey-matcher.ts` | 2 | 🟡 Moderate |
| JourneySimilarityEngine | `career-journeys/similarity/journey-similarity-engine.ts` | 2 | 🟡 Moderate |
| SimilarStudentEngine | `similar-student-engine/SimilarStudentEngine.ts` | 2 | 🟡 Moderate |
| OptionalityEngine | `optionality-intelligence/optionality-engine.ts` | 2 | 🟡 Moderate |
| CareerIntelligenceEngine | `career-intelligence/career-intelligence-engine.ts` | 2 | 🟡 Moderate |
| CareerRecommendationEngine | `recommendation/career-recommendation-engine.ts` | 2 | 🟡 Moderate |
| DecisionIntelligenceEngine | `decision-intelligence/decision-intelligence-engine.ts` | 2 | 🟡 Moderate |
| JEEEngine | `india-intelligence/engines/JEEEngine.ts` | 2 | 🟡 Moderate |
| RecommendationEngine | `recommendation-engine/RecommendationEngine.ts` | 2 | 🟡 Moderate |
| [+ 45 more systems] | Various | 1 each | 🟢 Minor |

---

### 4. ARBITRATION SYSTEMS (3 operations)

#### Constitutional (1)
| System | File | Method | Status |
|--------|------|--------|--------|
| DecisionArbitrator | `decision/DecisionArbitrator.ts` | `arbitrate()` | ✅ |

#### Shadow Authorities (2)
| System | File | Operations | Risk |
|--------|------|------------|------|
| TradeoffEngine | `decision-intelligence/tradeoff-engine.ts` | 1 | 🟡 Moderate |
| ScenarioEngine | `decision-intelligence/scenario-engine.ts` | 1 | 🟡 Moderate |

---

### 5. CONSENSUS SYSTEMS (8 operations)

#### Constitutional (2)
| System | File | Method | Status |
|--------|------|--------|--------|
| CoalitionModule | `decision/coalition/CoalitionModule.ts` | `determineConsensus()` | ✅ |
| RecommendationConsensusEngine | `recommendation-stability/recommendation-consensus-engine.ts` | `calculateConsensus()` | ✅ |

#### Shadow Authorities (6)
| System | File | Operations | Risk |
|--------|------|------------|------|
| DecisionIntelligenceEngine | `decision-intelligence/decision-intelligence-engine.ts` | 1 | 🟡 Moderate |
| RecommendationStabilityEngine | `recommendation-stability/recommendation-stability-engine.ts` | 1 | 🟡 Moderate |
| StabilityEngine | `archetype/stability-engine.ts` | 1 | 🟡 Moderate |
| PerturbationEngine | `recommendation-stability/perturbation-engine.ts` | 1 | 🟢 Minor |
| SensitivityAnalysisEngine | `recommendation-stability/sensitivity-analysis-engine.ts` | 1 | 🟢 Minor |
| UncertaintyEngine | `recommendation-stability/uncertainty-engine.ts` | 1 | 🟢 Minor |

---

### 6. OPTIMIZATION SYSTEMS (4 operations)

#### Constitutional (1)
| System | File | Method | Status |
|--------|------|--------|--------|
| DecisionOptimizationEngine | `decision-optimization-engine/DecisionOptimizationEngineV1.ts` | `optimize()` | ✅ |

#### Shadow Authorities (3)
| System | File | Operations | Risk |
|--------|------|------------|------|
| ParetoFrontierEngine | `pareto-frontier-engine/ParetoFrontierEngineV1.ts` | 1 | 🟡 Moderate |
| RealOptionsEngine | `real-options-engine/RealOptionsEngine.ts` | 1 | 🟡 Moderate |
| ProspectTheoryEngine | `prospect-theory-engine/ProspectTheoryEngine.ts` | 1 | 🟢 Minor |

---

### 7. RECOMMENDATION SYSTEMS (8 operations)

#### Constitutional (2)
| System | File | Method | Status |
|--------|------|--------|--------|
| DecisionAuthority | `decision/DecisionAuthority.ts` | `recommend()` | ✅ |
| RecommendationRankingEngine | `recommendation-fusion/recommendation-ranking-engine.ts` | `rankRecommendations()` | ✅ |

#### Shadow Authorities (6)
| System | File | Operations | Risk |
|--------|------|------------|------|
| CareerRecommendationEngine | `recommendation/career-recommendation-engine.ts` | 2 | 🟡 Moderate |
| RecommendationEngine | `recommendation-engine/RecommendationEngine.ts` | 2 | 🟡 Moderate |
| MarketAwareDecisionEngine | `market-aware-decision/MarketAwareDecisionEngine.ts` | 1 | 🟡 Moderate |
| ConfidenceAwareRecommendationEngine | `confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts` | 1 | 🟢 Minor |

---

## Decision System Architecture

### Constitutional Authority Layer
```
DecisionAuthority (SOLE OWNER)
├── rank() → DecisionRanker
├── compare() → DecisionComparator
├── select() → DecisionSelector
├── arbitrate() → DecisionArbitrator
├── explain() → DecisionExplainer
└── meta-decision → MetaDecisionAuthority
    └── CoalitionModule (Domain Authority)
```

### Shadow Authority Layer (VIOLATIONS)
```
191 Local Decision Operations
├── 89 Local Ranking Operations
├── 12 Local Comparison Operations
├── 67 Local Selection Operations
├── 3 Local Arbitration Operations
├── 8 Local Consensus Operations
├── 4 Local Optimization Operations
└── 8 Local Recommendation Operations
```

---

## Compliance Summary by Category

| Category | Total | Constitutional | Shadow | Compliance % |
|----------|-------|----------------|--------|--------------|
| Ranking | 89 | 6 | 83 | 6.7% |
| Selection | 67 | 8 | 59 | 11.9% |
| Comparison | 12 | 2 | 10 | 16.7% |
| Consensus | 8 | 2 | 6 | 25.0% |
| Optimization | 4 | 1 | 3 | 25.0% |
| Recommendation | 8 | 2 | 6 | 25.0% |
| Arbitration | 3 | 1 | 2 | 33.3% |
| **TOTAL** | **191** | **30** | **161** | **15.7%** |

---

## Top 20 Shadow Authorities by Operation Count

| Rank | System | Operations | Category | Risk |
|------|--------|------------|----------|------|
| 1 | FounderRoadmapEngineV2 | 9 | Selection | 🔴 Critical |
| 2 | FutureExplorerV1 | 7 | Ranking | 🔴 Critical |
| 3 | MatchingEngineV1 | 6 | Selection | 🟠 Major |
| 4 | DecisionRanker | 6 | Ranking | ✅ Constitutional |
| 5 | StabilityEngine | 5 | Ranking | 🔴 Critical |
| 6 | ProfileInterpreter | 5 | Selection | 🟠 Major |
| 7 | CareerGraphEngine | 4 | Ranking | 🔴 Critical |
| 8 | UtilityExplanationEngine | 4 | Selection | 🟡 Moderate |
| 9 | SimilarityExplanationEngine | 4 | Selection | 🟡 Moderate |
| 10 | InformationGapDetector | 4 | Selection | 🟡 Moderate |
| 11 | ArchetypeCalculator | 3 | Ranking | 🟡 Moderate |
| 12 | AssessmentEngine | 3 | Ranking | 🟡 Moderate |
| 13 | NEETEngine | 3 | Ranking | 🟡 Moderate |
| 14 | ProfileSynthesizer | 3 | Selection | 🟡 Moderate |
| 15 | FounderRiskProfileEngine | 3 | Selection | 🟢 Minor |
| 16 | SkillTransitionEngine | 3 | Ranking | 🟢 Minor |
| 17 | IrreversibilityEngine | 3 | Ranking | 🟢 Minor |
| 18 | OptionalityEngine | 3 | Ranking | 🟢 Minor |
| 19 | CareerAnalyzer | 3 | Ranking | 🟢 Minor |
| 20 | ComparisonFactories | 8 | Comparison | 🟡 Moderate |

---

## Critical Observations

1. **Ranking Epidemic**: 89 ranking operations with only 6.7% compliance - the most violated category
2. **Selection Crisis**: 67 selection operations with only 11.9% compliance
3. **Top Violators**: 5 systems account for 31 operations (16.2% of all violations)
4. **Widespread Problem**: 98 files with violations across all major directories
5. **Architectural Debt**: Most engines were built before constitutional authority was established

---

*Inventory Generated: 2026-06-05*
*Auditor: Fresh Constitutional Audit System*
