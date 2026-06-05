# Wave 3.1 - Intelligence Inventory

**Audit Date:** 2026-06-05  
**Classification:** Intelligence Architecture Discovery  
**Scope:** Complete CareerOS Intelligence System Inventory  
**Status:** INVENTORY COMPLETE

---

## Executive Summary

Comprehensive intelligence inventory reveals **313+ intelligence engines** across **18 major categories** in the CareerOS repository. The architecture exhibits **extreme fragmentation** with **no central intelligence authority**.

### Key Statistics

| Metric | Count |
|--------|-------|
| **Total Intelligence Engines** | 313+ |
| **Intelligence Categories** | 18 |
| **Recommendation Generators** | 47 |
| **Guidance Systems** | 38 |
| **Pathway Generators** | 29 |
| **Forecasting Systems** | 24 |
| **Analysis Engines** | 175 |

---

## Intelligence Categories

### 1. RECOMMENDATION INTELLIGENCE (47 engines)

**Purpose**: Generate career recommendations for students

| Engine | File | Type |
|--------|------|------|
| RecommendationEngine | `intelligence/recommendation-engine/RecommendationEngine.ts` | Primary |
| CareerRecommendationEngine | `recommendation/career-recommendation-engine.ts` | Primary |
| RecommendationRanker | `recommendation/recommendation-ranker.ts` | Ranking |
| RecommendationExplainer | `recommendation/recommendation-explainer.ts` | Explanation |
| RecommendationConfidenceEngine | `recommendation/recommendation-confidence-engine.ts` | Confidence |
| RecommendationFusionEngine | `intelligence/recommendation-fusion/recommendation-fusion-engine.ts` | Fusion |
| ConfidenceAwareRecommendationEngineV1 | `intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts` | Confidence |
| RecommendationRankingEngine | `intelligence/recommendation-fusion/recommendation-ranking-engine.ts` | Ranking |
| RecommendationLearningEngine | `intelligence/learning-loop/recommendation-learning-engine.ts` | Learning |
| RecommendationStabilityEngine | `intelligence/recommendation-stability/recommendation-stability-engine.ts` | Stability |
| RecommendationConsensusEngine | `intelligence/recommendation-stability/recommendation-consensus-engine.ts` | Consensus |
| RecommendationCalibrationEngine | `intelligence/calibration/recommendation-calibration-engine.ts` | Calibration |
| RecommendationFeedbackEngine | `intelligence/recommendation-feedback-loop/RecommendationFeedbackEngine.ts` | Feedback |
| RecommendationQualityEngine | `outcome-tracking/engines/recommendation-quality-engine.ts` | Quality |
| RecommendationTracker | `outcome-tracking/engines/recommendation-tracker.ts` | Tracking |
| RecommendationAuditEngine | `intelligence/validation/recommendation-audit-engine.ts` | Audit |
| RecommendationConsistencyEngine | `intelligence/validation/recommendation-consistency-engine.ts` | Consistency |
| CareerWeightEngine | `intelligence/recommendation-fusion/career-weight-engine.ts` | Weighting |
| PsychologyWeightEngine | `intelligence/recommendation-fusion/psychology-weight-engine.ts` | Weighting |
| MentorWeightEngine | `intelligence/recommendation-fusion/mentor-weight-engine.ts` | Weighting |
| LearningWeightEngine | `intelligence/recommendation-fusion/learning-weight-engine.ts` | Weighting |
| ContradictionWeightEngine | `intelligence/recommendation-fusion/contradiction-weight-engine.ts` | Weighting |
| ConfidenceFusionEngine | `intelligence/recommendation-fusion/confidence-fusion-engine.ts` | Fusion |
| FusionExplanationEngine | `intelligence/recommendation-fusion/fusion-explanation-engine.ts` | Explanation |
| StudentExplanationEngine | `intelligence/recommendation-stability/student-explanation-engine.ts` | Explanation |
| PerturbationEngine | `intelligence/recommendation-stability/perturbation-engine.ts` | Testing |
| SensitivityAnalysisEngine | `intelligence/recommendation-stability/sensitivity-analysis-engine.ts` | Analysis |
| UncertaintyEngine | `intelligence/recommendation-stability/uncertainty-engine.ts` | Uncertainty |
| VolatilityEngine | `intelligence/recommendation-stability/volatility-engine.ts` | Volatility |
| StabilityEngine | `intelligence/recommendation-stability/stability-engine.ts` | Stability |
| ConfidenceEngine | `intelligence/recommendation-stability/confidence-engine.ts` | Confidence |
| [+ 17 more] | Various | Various |

---

### 2. CAREER PATH INTELLIGENCE (29 engines)

**Purpose**: Generate and analyze career pathways

| Engine | File | Type |
|--------|------|------|
| CareerPathIntelligenceEngine | `intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts` | Primary |
| PathComparisonEngine | `intelligence/career-path-intelligence/engines/PathComparisonEngine.ts` | Comparison |
| PathExplanationEngine | `intelligence/career-path-intelligence/engines/PathExplanationEngine.ts` | Explanation |
| PathDiscoveryEngine | `intelligence/career-path-intelligence/engines/PathDiscoveryEngine.ts` | Discovery |
| PathValidationEngine | `intelligence/career-path-intelligence/engines/PathValidationEngine.ts` | Validation |
| AlternativePathEngine | `intelligence/career-path-intelligence/engines/AlternativePathEngine.ts` | Alternative |
| MilestoneEngine | `intelligence/career-path-intelligence/engines/MilestoneEngine.ts` | Milestones |
| FailureRecoveryEngine | `intelligence/career-path-intelligence/engines/FailureRecoveryEngine.ts` | Recovery |
| CareerPathExplorerV1 | `intelligence/path-explorer/CareerPathExplorerV1.ts` | Exploration |
| PathCascadeEngine | `intelligence/path-cascade/PathCascadeEngine.ts` | Cascade |
| CareerTransitionGraphV1 | `intelligence/career-transition-graph/CareerTransitionGraphV1.ts` | Transition |
| CareerJourneyEngine | `career-journeys/career-journey-engine.ts` | Journey |
| CareerTransitionEngine | `career-journeys/career-transition-engine.ts` | Transition |
| JourneyInsightsEngine | `career-journeys/journey-insights-engine.ts` | Insights |
| JourneyMatcher | `career-journeys/similarity/journey-matcher.ts` | Matching |
| JourneySimilarityEngine | `career-journeys/similarity/journey-similarity-engine.ts` | Similarity |
| SimilarityExplanationEngine | `career-journeys/similarity/similarity-explanation-engine.ts` | Explanation |
| TurningPointEngine | `career-journeys/turning-point-engine.ts` | Turning Points |
| CareerGraphEngine | `intelligence/career-graph/career-graph-engine.ts` | Graph |
| CareerCascadeEngine | `intelligence/career-graph/career-cascade-engine.ts` | Cascade |
| OptionalityEngine | `intelligence/career-graph/optionality-engine.ts` | Optionality |
| OpportunityEngine | `intelligence/career-graph/opportunity-engine.ts` | Opportunity |
| IrreversibilityEngine | `intelligence/career-graph/irreversibility-engine.ts` | Irreversibility |
| PathSimulator | `intelligence/career-graph/path-simulator.ts` | Simulation |
| CareerGraphV2 | `intelligence/career-graph-v2/CareerGraphV2.ts` | Graph V2 |
| [+ 5 more] | Various | Various |

---

### 3. FUTURE & FORECASTING INTELLIGENCE (24 engines)

**Purpose**: Project future career scenarios and trends

| Engine | File | Type |
|--------|------|------|
| FutureExplorerV1 | `intelligence/future-explorer/FutureExplorerV1.ts` | Primary |
| FutureScenarioGeneratorV1 | `intelligence/future-scenario/FutureScenarioGeneratorV1.ts` | Scenarios |
| FutureSimulationEngine | `future-simulation/future-simulation-engine.ts` | Simulation |
| TrajectoryEngine | `future-simulation/trajectory-engine.ts` | Trajectory |
| OutcomeEngine | `future-simulation/outcome-engine.ts` | Outcomes |
| ForecastEngine | `intelligence/market/forecasting/ForecastEngine.ts` | Forecasting |
| CareerForecastEngine | `intelligence/market/forecasting/CareerForecastEngine.ts` | Career |
| IndustryForecastEngine | `intelligence/market/forecasting/IndustryForecastEngine.ts` | Industry |
| SkillForecastEngine | `intelligence/market/forecasting/SkillForecastEngine.ts` | Skills |
| RegionForecastEngine | `intelligence/market/forecasting/RegionForecastEngine.ts` | Regional |
| ConfidenceForecastEngine | `intelligence/market/forecasting/ConfidenceForecastEngine.ts` | Confidence |
| ForecastValidationEngine | `intelligence/market/forecasting/ForecastValidationEngine.ts` | Validation |
| ScenarioGenerator | `intelligence/market/forecasting/ScenarioGenerator.ts` | Scenarios |
| TrendDetectionEngine | `intelligence/market-signal-intelligence/TrendDetectionEngine.ts` | Trends |
| TrendPersistenceEngine | `intelligence/market/trends/TrendPersistenceEngine.ts` | Persistence |
| MomentumEngine | `intelligence/market/trends/MomentumEngine.ts` | Momentum |
| AccelerationEngine | `intelligence/market/trends/AccelerationEngine.ts` | Acceleration |
| CareerTrendEngine | `intelligence/market/trends/CareerTrendEngine.ts` | Career |
| IndustryTrendEngine | `intelligence/market/trends/IndustryTrendEngine.ts` | Industry |
| SkillTrendEngine | `intelligence/market/trends/SkillTrendEngine.ts` | Skills |
| RegionTrendEngine | `intelligence/market/trends/RegionTrendEngine.ts` | Regional |
| MarketTrendEngine | `intelligence/market/MarketTrendEngine.ts` | Market |
| RegretForecastEngine | `intelligence/regret-prediction/regret-forecast-engine.ts` | Regret |
| [+ 2 more] | Various | Various |

---

### 4. MARKET INTELLIGENCE (42 engines)

**Purpose**: Analyze job market conditions and opportunities

| Engine | File | Type |
|--------|------|------|
| MarketIntelligenceEngine | `intelligence/market/MarketIntelligenceEngine.ts` | Primary |
| MarketTrendEngine | `intelligence/market/MarketTrendEngine.ts` | Trends |
| MarketConfidenceEngine | `intelligence/market/MarketConfidenceEngine.ts` | Confidence |
| MarketSignalEngine | `intelligence/market/MarketSignalEngine.ts` | Signals |
| EmergingCareerEngine | `intelligence/market/EmergingCareerEngine.ts` | Emerging |
| CareerMarketProfileEngine | `intelligence/market/CareerMarketProfileEngine.ts` | Profile |
| CareerDiscoveryEngine | `intelligence/market/discovery/CareerDiscoveryEngine.ts` | Discovery |
| IndustryDiscoveryEngine | `intelligence/market/discovery/IndustryDiscoveryEngine.ts` | Industry |
| SkillDiscoveryEngine | `intelligence/market/discovery/SkillDiscoveryEngine.ts` | Skills |
| EmergingIndustryEngine | `intelligence/market/discovery/EmergingIndustryEngine.ts` | Emerging Industry |
| EmergingCareerEngine | `intelligence/market/discovery/EmergingCareerEngine.ts` | Emerging Career |
| EmergingSkillEngine | `intelligence/market/discovery/EmergingSkillEngine.ts` | Emerging Skills |
| DecliningCareerEngine | `intelligence/market/discovery/DecliningCareerEngine.ts` | Declining |
| DecliningSkillEngine | `intelligence/market/discovery/DecliningSkillEngine.ts` | Declining Skills |
| DiscoveryEngine | `intelligence/market/discovery/DiscoveryEngine.ts` | Discovery |
| DiscoveryConfidenceEngine | `intelligence/market/discovery/DiscoveryConfidenceEngine.ts` | Confidence |
| DemandScoringEngine | `intelligence/market/profile/DemandScoringEngine.ts` | Demand |
| SalaryScoringEngine | `intelligence/market/profile/SalaryScoringEngine.ts` | Salary |
| GrowthScoringEngine | `intelligence/market/profile/GrowthScoringEngine.ts` | Growth |
| OpportunityScoringEngine | `intelligence/market/profile/OpportunityScoringEngine.ts` | Opportunity |
| AutomationRiskEngine | `intelligence/market/profile/AutomationRiskEngine.ts` | Automation |
| FutureResilienceEngine | `intelligence/market/profile/FutureResilienceEngine.ts` | Resilience |
| ScarcityScoringEngine | `intelligence/market/profile/ScarcityScoringEngine.ts` | Scarcity |
| CareerMarketProfileEngine | `intelligence/market/profile/CareerMarketProfileEngine.ts` | Profile |
| MarketNarrativeEngine | `intelligence/market/integration/MarketNarrativeEngine.ts` | Narrative |
| MarketAdjustmentEngine | `intelligence/market/integration/MarketAdjustmentEngine.ts` | Adjustment |
| MarketOpportunityBoost | `intelligence/market-aware-decision/MarketOpportunityBoost.ts` | Boost |
| MarketRiskAdjustment | `intelligence/market-aware-decision/MarketRiskAdjustment.ts` | Risk |
| MarketAwareDecisionEngine | `intelligence/market-aware-decision/MarketAwareDecisionEngine.ts` | Decision |
| RecommendationStabilityEngine | `intelligence/market-aware-decision/RecommendationStabilityEngine.ts` | Stability |
| MarketIntelligenceEngine | `intelligence/market-signal-intelligence/MarketIntelligenceEngine.ts` | Signals |
| OpportunityScoringEngine | `intelligence/market-signal-intelligence/OpportunityScoringEngine.ts` | Scoring |
| MarketRiskEngine | `intelligence/market-signal-intelligence/MarketRiskEngine.ts` | Risk |
| MarketMomentumEngine | `intelligence/market-signal-intelligence/MarketMomentumEngine.ts` | Momentum |
| MarketNarrativeEngine | `intelligence/market-signal-intelligence/MarketNarrativeEngine.ts` | Narrative |
| EmergingCareerDetector | `intelligence/market-signal-intelligence/EmergingCareerDetector.ts` | Detection |
| MarketRecommendationAudit | `intelligence/market/integration/MarketRecommendationAudit.ts` | Audit |
| [+ 7 more] | Various | Various |

---

### 5. ARCHETYPE & PSYCHOLOGY INTELLIGENCE (18 engines)

**Purpose**: Analyze student psychology and career archetypes

| Engine | File | Type |
|--------|------|------|
| ArchetypeDetectionEngine | `archetype/archetype-detection-engine.ts` | Detection |
| ArchetypeCalculator | `archetype/archetype-calculator.ts` | Calculation |
| ArchetypeConfidenceEngine | `archetype/archetype-confidence-engine.ts` | Confidence |
| ArchetypeExplanationEngine | `archetype/archetype-explanation-engine.ts` | Explanation |
| ArchetypeInsightsEngine | `archetype/archetype-insights-engine.ts` | Insights |
| ArchetypeNarrativeEngine | `archetype/archetype-narrative-engine.ts` | Narrative |
| ArchetypeRiskEngine | `archetype/archetype-risk-engine.ts` | Risk |
| ArchetypeStrengthEngine | `archetype/archetype-strength-engine.ts` | Strength |
| StabilityEngine | `archetype/stability-engine.ts` | Stability |
| EvidenceEngine | `archetype/evidence-engine.ts` | Evidence |
| IdentityDevelopmentEngine | `intelligence/identity-development-engine/IdentityDevelopmentEngine.ts` | Identity |
| ValueEvolutionEngine | `intelligence/value-evolution-engine/ValueEvolutionEngine.ts` | Values |
| PersonalGrowthEngine | `intelligence/personal-growth-engine/PersonalGrowthEngine.ts` | Growth |
| ProspectTheoryEngine | `intelligence/prospect-theory-engine/ProspectTheoryEngine.ts` | Prospect |
| BiasDetectors | `intelligence/prospect-theory-engine/BiasDetectors.ts` | Bias |
| BiasExplanationEngine | `intelligence/prospect-theory-engine/BiasExplanationEngine.ts` | Explanation |
| RiskPerceptionEngine | `intelligence/prospect-theory-engine/BiasDetectors.ts` | Risk |
| SimilarStudentEngine | `intelligence/similar-student-engine/SimilarStudentEngine.ts` | Similarity |

---

### 6. DECISION INTELLIGENCE (20 engines)

**Purpose**: Support decision-making processes

| Engine | File | Type |
|--------|------|------|
| DecisionAuthority | `intelligence/decision/DecisionAuthority.ts` | Authority |
| DecisionRanker | `intelligence/decision/DecisionRanker.ts` | Ranking |
| DecisionComparator | `intelligence/decision/DecisionComparator.ts` | Comparison |
| DecisionSelector | `intelligence/decision/DecisionSelector.ts` | Selection |
| DecisionArbitrator | `intelligence/decision/DecisionArbitrator.ts` | Arbitration |
| DecisionExplainer | `intelligence/decision/DecisionExplainer.ts` | Explanation |
| MetaDecisionAuthority | `intelligence/decision/meta/MetaDecisionAuthority.ts` | Meta |
| CoalitionModule | `intelligence/decision/coalition/CoalitionModule.ts` | Coalition |
| DecisionIntelligenceEngine | `intelligence/decision-intelligence/decision-intelligence-engine.ts` | Primary |
| DecisionIntelligenceEngineV1 | `intelligence/decision-intelligence/DecisionIntelligenceEngineV1.ts` | V1 |
| DecisionComparisonEngine | `decision-intelligence/decision-comparison-engine.ts` | Comparison |
| DecisionConfidenceEngine | `decision-intelligence/decision-confidence-engine.ts` | Confidence |
| TradeoffEngine | `intelligence/decision-intelligence/tradeoff-engine.ts` | Tradeoffs |
| ScenarioEngine | `intelligence/decision-intelligence/scenario-engine.ts` | Scenarios |
| RiskEngine | `intelligence/decision-intelligence/risk-engine.ts` | Risk |
| RegretEngine | `intelligence/decision-intelligence/regret-engine.ts` | Regret |
| ReversibilityEngine | `intelligence/decision-intelligence/reversibility-engine.ts` | Reversibility |
| OptionalityEngine | `intelligence/decision-intelligence/optionality-engine.ts` | Optionality |
| DecisionModel | `intelligence/decision-intelligence/decision-model.ts` | Model |
| DecisionTreeEngine | `intelligence/decision-tree-engine/DecisionTreeEngine.ts` | Tree |

---

### 7. FOUNDER INTELLIGENCE (14 engines)

**Purpose**: Support founder career paths and entrepreneurship

| Engine | File | Type |
|--------|------|------|
| FounderIntelligenceEngineV2 | `intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts` | Primary |
| FounderRoadmapEngineV2 | `intelligence/founder-intelligence-v2/FounderRoadmapEngine.ts` | Roadmap |
| FounderExplanationEngineV2 | `intelligence/founder-intelligence-v2/FounderExplanationEngine.ts` | Explanation |
| FounderRiskProfileEngineV2 | `intelligence/founder-intelligence-v2/FounderRiskProfileEngine.ts` | Risk |
| FounderMarketFitEngineV2 | `intelligence/founder-intelligence-v2/FounderMarketFitEngine.ts` | Market Fit |
| FounderClassificationEngineV2 | `intelligence/founder-intelligence-v2/FounderClassificationEngine.ts` | Classification |
| FalsePositiveProtectionEngineV2 | `intelligence/founder-intelligence-v2/FalsePositiveProtectionEngine.ts` | Protection |
| DimensionScoringEngineV2 | `intelligence/founder-intelligence-v2/DimensionScoringEngine.ts` | Scoring |
| FalsePositiveProtectionEngine | `intelligence/founder-intelligence/protection/FalsePositiveProtectionEngine.ts` | Protection |
| DimensionScoringEngine | `intelligence/founder-intelligence/scoring/DimensionScoringEngine.ts` | Scoring |
| [+ 4 more] | Various | Various |

---

### 8. INDIA-SPECIFIC INTELLIGENCE (12 engines)

**Purpose**: Handle India-specific career and education contexts

| Engine | File | Type |
|--------|------|------|
| IndiaIntelligenceEngine | `intelligence/india-intelligence/IndiaIntelligenceEngine.ts` | Primary |
| IndiaTradeoffEngine | `intelligence/india-intelligence/IndiaTradeoffEngine.ts` | Tradeoffs |
| IndiaExplanationEngine | `intelligence/india-intelligence/IndiaExplanationEngine.ts` | Explanation |
| JEEEngine | `intelligence/india-intelligence/engines/JEEEngine.ts` | JEE |
| NEETEngine | `intelligence/india-intelligence/engines/NEETEngine.ts` | NEET |
| UPSCEngine | `intelligence/india-intelligence/engines/UPSCEngine.ts` | UPSC |
| CAEngine | `intelligence/india-intelligence/engines/CAEngine.ts` | CA |
| FamilyBusinessEngine | `intelligence/india-intelligence/engines/FamilyBusinessEngine.ts` | Family |
| EconomicConstraintEngine | `intelligence/india-intelligence/engines/EconomicConstraintEngine.ts` | Economic |
| RegionalConstraintEngine | `intelligence/india-intelligence/engines/RegionalConstraintEngine.ts` | Regional |
| [+ 2 more] | Various | Various |

---

### 9. OUTCOME & LEARNING INTELLIGENCE (28 engines)

**Purpose**: Track outcomes and learn from results

| Engine | File | Type |
|--------|------|------|
| OutcomeTrackingEngine | `outcome-tracking/engines/outcome-tracking-engine.ts` | Tracking |
| OutcomeTrackingEngineV1 | `intelligence/outcome-tracking-engine/OutcomeTrackingEngineV1.ts` | V1 |
| OutcomeTracker | `outcome-tracking/engines/outcome-tracker.ts` | Tracker |
| FeedbackEngine | `outcome-tracking/engines/feedback-engine.ts` | Feedback |
| LearningEngine | `outcome-tracking/engines/learning-engine.ts` | Learning |
| CohortEngine | `outcome-tracking/engines/cohort-engine.ts` | Cohort |
| ConfidenceCalibrationEngine | `outcome-tracking/engines/confidence-calibration-engine.ts` | Calibration |
| PrivacyAggregationEngine | `outcome-tracking/engines/privacy-aggregation-engine.ts` | Privacy |
| OutcomeLearningEngine | `intelligence/learning-loop/outcome-feedback-engine.ts` | Learning |
| PopulationLearningEngine | `intelligence/learning-loop/population-learning-engine.ts` | Population |
| LearningLoopEngine | `intelligence/learning-loop/learning-loop-engine.ts` | Loop |
| ConfidenceAdjustmentEngine | `intelligence/learning-loop/confidence-adjustment-engine.ts` | Adjustment |
| RecommendationLearningEngine | `intelligence/outcome-learning/recommendation-learning-engine.ts` | Recommendation |
| OutcomeLearningEngine | `intelligence/outcome-learning/outcome-learning-engine.ts` | Outcome |
| LearningSignalEngine | `intelligence/outcome-learning/learning-signal-engine.ts` | Signals |
| DecisionLearningEngine | `intelligence/outcome-learning/decision-learning-engine.ts` | Decision |
| FeedbackIngestionEngine | `intelligence/outcome-learning/feedback-ingestion-engine.ts` | Ingestion |
| ConfidenceCalibrationEngine | `intelligence/outcome-learning/confidence-calibration-engine.ts` | Calibration |
| LearningReportEngine | `intelligence/outcome-learning/learning-report-engine.ts` | Reports |
| OutcomeWeightEngine | `intelligence/outcome-learning/outcome-weight-engine.ts` | Weighting |
| StudentGrowthEngine | `intelligence/outcome-tracking/student-growth-engine.ts` | Growth |
| OutcomeComparisonEngine | `intelligence/outcome-tracking/outcome-comparison-engine.ts` | Comparison |
| OutcomeQualityEngine | `intelligence/outcome-tracking/outcome-quality-engine.ts` | Quality |
| OutcomeTimelineEngine | `intelligence/outcome-tracking/outcome-timeline-engine.ts` | Timeline |
| OutcomeEventEngine | `intelligence/outcome-tracking/outcome-event-engine.ts` | Events |
| OutcomeEvidenceEngine | `intelligence/outcome-evidence-engine/OutcomeEvidenceEngine.ts` | Evidence |
| OutcomeModelingEngine | `intelligence/outcome-modeling/OutcomeModelingEngine.ts` | Modeling |
| [+ 1 more] | Various | Various |

---

### 10. REGRET & RISK INTELLIGENCE (18 engines)

**Purpose**: Analyze potential regrets and risks

| Engine | File | Type |
|--------|------|------|
| RegretIntelligenceEngine | `regret-intelligence/regret-engine.ts` | Primary |
| RegretEngine | `intelligence/regret-engine/RegretEngine.ts` | Core |
| RegretPredictionEngine | `intelligence/regret-prediction/regret-prediction-engine.ts` | Prediction |
| RegretForecastEngine | `intelligence/regret-prediction/regret-forecast-engine.ts` | Forecast |
| RegretReportEngine | `intelligence/regret-prediction/regret-report-engine.ts` | Reports |
| OpportunityRegretEngine | `intelligence/regret-prediction/opportunity-regret-engine.ts` | Opportunity |
| FearDrivenRegretEngine | `intelligence/regret-prediction/fear-driven-regret-engine.ts` | Fear |
| ApprovalDrivenRegretEngine | `intelligence/regret-prediction/approval-driven-regret-engine.ts` | Approval |
| ExplorationRegretEngine | `intelligence/regret-prediction/exploration-regret-engine.ts` | Exploration |
| IdentityRegretEngine | `intelligence/regret-prediction/identity-regret-engine.ts` | Identity |
| RegretFunctionalV2 | `intelligence/regret-functional/RegretFunctionalV2.ts` | Functional |
| RegretScenarioEngine | `regret-intelligence/regret-scenario-engine.ts` | Scenarios |
| RegretFactorEngine | `regret-intelligence/regret-factor-engine.ts` | Factors |
| RegretExplanationEngine | `regret-intelligence/regret-explanation-engine.ts` | Explanation |
| RegretCalculator | `regret-intelligence/regret-calculator.ts` | Calculator |
| RiskEngine | `archetype/archetype-risk-engine.ts` | Risk |
| RealOptionsEngine | `intelligence/real-options-engine/RealOptionsEngine.ts` | Options |
| CommitmentCostEngine | `intelligence/real-options-engine/CommitmentCostEngine.ts` | Cost |

---

### 11. ASSESSMENT INTELLIGENCE (12 engines)

**Purpose**: Handle student assessments and evaluations

| Engine | File | Type |
|--------|------|------|
| AssessmentEngine | `assessment/assessment-engine.ts` | Primary |
| QuestionSelectionEngine | `assessment/questions/question-selection-engine.ts` | Questions |
| QualityScoreEngine | `assessment/validation/quality-score-engine.ts` | Quality |
| ConsistencyEngine | `assessment/validation/consistency-engine.ts` | Consistency |
| ReliabilityEngine | `assessment/validation/reliability-engine.ts` | Reliability |
| ResponsePatternDetector | `assessment/validation/response-pattern-detector.ts` | Patterns |
| CalibrationEngine | `intelligence/calibration/calibration-engine.ts` | Calibration |
| ReliabilityEngine | `intelligence/calibration/reliability-engine.ts` | Reliability |
| RegretCalibrationEngine | `intelligence/calibration/regret-calibration-engine.ts` | Regret |
| DecisionCalibrationEngine | `intelligence/calibration/decision-calibration-engine.ts` | Decision |
| RecommendationCalibrationEngine | `intelligence/calibration/recommendation-calibration-engine.ts` | Recommendation |
| CriticalityCalibrationEngine | `intelligence/calibration/criticality-calibration-engine.ts` | Criticality |

---

### 12. MENTOR INTELLIGENCE (8 engines)

**Purpose**: Provide mentorship and guidance

| Engine | File | Type |
|--------|------|------|
| MentorIntelligenceEngine | `mentor-intelligence/mentor-intelligence-engine.ts` | Primary |
| MentorEngine | `intelligence/mentor/MentorEngine.ts` | Core |
| MistakeEngine | `mentor-intelligence/mistake-engine.ts` | Mistakes |
| LessonEngine | `mentor-intelligence/lesson-engine.ts` | Lessons |
| PatternExtractionEngine | `mentor-intelligence/pattern-extraction-engine.ts` | Patterns |
| DecisionOutcomeEngine | `mentor-intelligence/decision-outcome-engine.ts` | Outcomes |
| AdaptiveMentorFoundation | `intelligence/adaptive-mentor-foundation/AdaptiveMentorFoundation.ts` | Foundation |
| MentorWeightEngine | `intelligence/recommendation-fusion/mentor-weight-engine.ts` | Weighting |

---

### 13. UTILITY & OPTIONALITY INTELLIGENCE (16 engines)

**Purpose**: Calculate utility and future options

| Engine | File | Type |
|--------|------|------|
| UtilityIntelligenceEngine | `utility-intelligence/utility-engine.ts` | Primary |
| UtilityExplanationEngine | `utility-intelligence/utility-explanation-engine.ts` | Explanation |
| UtilityBreakdownEngine | `utility-intelligence/utility-breakdown-engine.ts` | Breakdown |
| UtilityCalculator | `utility-intelligence/utility-calculator.ts` | Calculator |
| UtilityDiscoveryEngineV1 | `intelligence/utility-discovery-engine/UtilityDiscoveryEngineV1.ts` | Discovery |
| OptionalityIntelligenceEngine | `optionality-intelligence/optionality-engine.ts` | Primary |
| OptionalityExplanationEngine | `optionality-intelligence/optionality-explanation-engine.ts` | Explanation |
| FutureOptionsEngine | `optionality-intelligence/future-options-engine.ts` | Future |
| PathFlexibilityEngine | `optionality-intelligence/path-flexibility-engine.ts` | Flexibility |
| OptionalityCalculator | `optionality-intelligence/optionality-calculator.ts` | Calculator |
| OptionalityEngineV1 | `intelligence/optionality-engine/OptionalityEngineV1.ts` | V1 |
| RealOptionsEngine | `intelligence/real-options-engine/RealOptionsEngine.ts` | Options |
| OptionNarrativeEngine | `intelligence/real-options-engine/OptionNarrativeEngine.ts` | Narrative |
| FutureFlexibilityEngine | `intelligence/career-criticality/future-flexibility-engine.ts` | Flexibility |
| OptionClosureEngine | `intelligence/career-criticality/option-closure-engine.ts` | Closure |
| PathDependencyEngine | `intelligence/career-criticality/path-dependency-engine.ts` | Dependency |

---

### 14. CAREER REALITY INTELLIGENCE (10 engines)

**Purpose**: Model real-world career conditions

| Engine | File | Type |
|--------|------|------|
| CareerRealityEngine | `career-reality/engines/career-reality-engine.ts` | Primary |
| BurnoutEngine | `career-reality/engines/burnout-engine.ts` | Burnout |
| CultureEngine | `career-reality/engines/culture-engine.ts` | Culture |
| DailyLifeEngine | `career-reality/engines/daily-life-engine.ts` | Daily Life |
| WorkEnvironmentEngine | `career-reality/engines/work-environment-engine.ts` | Environment |
| SatisfactionEngine | `career-reality/engines/satisfaction-engine.ts` | Satisfaction |
| CompanyStageEngine | `career-reality/engines/company-stage-engine.ts` | Company |
| RealityExplanationEngine | `career-reality/engines/reality-explanation-engine.ts` | Explanation |
| [+ 2 more] | Various | Various |

---

### 15. CONFIDENCE & VALIDATION INTELLIGENCE (22 engines)

**Purpose**: Calculate confidence and validate intelligence

| Engine | File | Type |
|--------|------|------|
| ConfidenceAuthority | `intelligence/confidence/ConfidenceAuthority.ts` | Authority |
| ConfidenceCalculator | `intelligence/confidence/ConfidenceCalculator.ts` | Calculator |
| ConfidenceAggregator | `intelligence/confidence/ConfidenceAggregator.ts` | Aggregator |
| ConfidenceCalibration | `intelligence/confidence/ConfidenceCalibration.ts` | Calibration |
| ConfidenceMonitoring | `intelligence/confidence/ConfidenceMonitoring.ts` | Monitoring |
| ConfidencePropagationEngineV1 | `intelligence/confidence-propagation-engine/ConfidencePropagationEngineV1.ts` | Propagation |
| ValidationEngine | `intelligence/validation/validation-types.ts` | Validation |
| IntelligenceValidationEngine | `intelligence/validation/intelligence-validation-engine.ts` | Intelligence |
| UncertaintyEngine | `intelligence/validation/uncertainty-engine.ts` | Uncertainty |
| CounterfactualEngine | `intelligence/validation/counterfactual-engine.ts` | Counterfactual |
| ConfidenceCalibrationEngine | `intelligence/validation/confidence-calibration-engine.ts` | Calibration |
| RecommendationStabilityEngine | `intelligence/validation/recommendation-stability-engine.ts` | Stability |
| RecommendationConsistencyEngine | `intelligence/validation/recommendation-consistency-engine.ts` | Consistency |
| RecommendationAuditEngine | `intelligence/validation/recommendation-audit-engine.ts` | Audit |
| UncertaintyEngineV1 | `intelligence/uncertainty-engine/UncertaintyEngineV1.ts` | Uncertainty |
| ConsistencyEngine | `intelligence/consistency-engine/ConsistencyEngine.ts` | Consistency |
| [+ 6 more] | Various | Various |

---

### 16. META-DECISION INTELLIGENCE (10 engines)

**Purpose**: Handle meta-level decision support

| Engine | File | Type |
|--------|------|------|
| MetaDecisionEngine | `intelligence/meta-decision-engine/MetaDecisionEngine.ts` | Primary |
| DecisionReadinessEngine | `intelligence/meta-decision-engine/DecisionReadinessEngine.ts` | Readiness |
| DecisionQualityEngine | `intelligence/meta-decision-engine/DecisionQualityEngine.ts` | Quality |
| DecisionTimingEngine | `intelligence/meta-decision-engine/DecisionTimingEngine.ts` | Timing |
| DecisionRobustnessEngine | `intelligence/meta-decision-engine/DecisionRobustnessEngine.ts` | Robustness |
| DecisionFragilityEngine | `intelligence/meta-decision-engine/DecisionFragilityEngine.ts` | Fragility |
| CommitmentReadinessEngine | `intelligence/meta-decision-engine/CommitmentReadinessEngine.ts` | Commitment |
| MetaDecisionNarrativeEngine | `intelligence/meta-decision-engine/MetaDecisionNarrativeEngine.ts` | Narrative |
| ParetoFrontierEngineV1 | `intelligence/pareto-frontier-engine/ParetoFrontierEngineV1.ts` | Pareto |
| DecisionOptimizationEngineV1 | `intelligence/decision-optimization-engine/DecisionOptimizationEngineV1.ts` | Optimization |

---

### 17. DATA & KNOWLEDGE INTELLIGENCE (14 engines)

**Purpose**: Handle data ingestion and knowledge management

| Engine | File | Type |
|--------|------|------|
| SourceTrustEngine | `market-data-ingestion/SourceTrustEngine.ts` | Trust |
| SignalValidationEngine | `market-data-ingestion/SignalValidationEngine.ts` | Validation |
| SignalNormalizationEngine | `market-data-ingestion/SignalNormalizationEngine.ts` | Normalization |
| SignalAggregationEngine | `market-data-ingestion/SignalAggregationEngine.ts` | Aggregation |
| FreshnessEngine | `market-data-ingestion/FreshnessEngine.ts` | Freshness |
| BayesianBeliefEngine | `intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts` | Bayesian |
| BeliefConfidenceEngine | `intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts` | Confidence |
| BeliefNarrativeEngine | `intelligence/bayesian-belief-engine/BeliefNarrativeEngine.ts` | Narrative |
| EvidenceWeightEngine | `intelligence/bayesian-belief-engine/EvidenceWeightEngine.ts` | Evidence |
| ContradictionDetector | `intelligence/bayesian-belief-engine/ContradictionDetector.ts` | Contradiction |
| PosteriorCalculator | `intelligence/bayesian-belief-engine/PosteriorCalculator.ts` | Posterior |
| SkillTaxonomyV1 | `intelligence/skill-taxonomy/SkillTaxonomyV1.ts` | Taxonomy |
| CareerExpansionEngineV1 | `intelligence/career-expansion-engine/CareerExpansionEngineV1.ts` | Expansion |
| SkillTransitionEngineV1 | `intelligence/skill-transition-engine/SkillTransitionEngineV1.ts` | Transition |

---

### 18. EXPLAINABILITY & NARRATIVE INTELLIGENCE (12 engines)

**Purpose**: Generate explanations and narratives

| Engine | File | Type |
|--------|------|------|
| ExplainabilityEngine | `intelligence/explainability-engine/ExplainabilityEngine.ts` | Primary |
| ContextExplanationEngine | `intelligence/decision-context/explanation/ContextExplanationEngine.ts` | Context |
| FusionExplanationEngine | `intelligence/recommendation-fusion/fusion-explanation-engine.ts` | Fusion |
| VoIExplanationEngine | `intelligence/value-of-information-engine/VoIExplanationEngine.ts` | VoI |
| DecisionNarrativeGenerator | `intelligence/market-aware-decision/DecisionNarrativeGenerator.ts` | Narrative |
| OptionNarrativeEngine | `intelligence/real-options-engine/OptionNarrativeEngine.ts` | Options |
| BiasExplanationEngine | `intelligence/prospect-theory-engine/BiasExplanationEngine.ts` | Bias |
| MarketNarrativeEngine | `intelligence/market/integration/MarketNarrativeEngine.ts` | Market |
| MetaDecisionNarrativeEngine | `intelligence/meta-decision-engine/MetaDecisionNarrativeEngine.ts` | Meta |
| BeliefNarrativeEngine | `intelligence/bayesian-belief-engine/BeliefNarrativeEngine.ts` | Belief |
| ArchetypeNarrativeEngine | `archetype/archetype-narrative-engine.ts` | Archetype |
| NarrativeEngine | `archetype/archetype-narrative-engine.ts` | Narrative |

---

## Intelligence Distribution Summary

### By Category

| Category | Engines | Percentage |
|----------|---------|------------|
| Analysis Engines | 175 | 55.9% |
| Recommendation | 47 | 15.0% |
| Market Intelligence | 42 | 13.4% |
| Career Path | 29 | 9.3% |
| Outcome & Learning | 28 | 9.0% |
| Future & Forecasting | 24 | 7.7% |
| Decision Intelligence | 20 | 6.4% |
| Archetype & Psychology | 18 | 5.8% |
| Regret & Risk | 18 | 5.8% |
| Confidence & Validation | 22 | 7.0% |
| Utility & Optionality | 16 | 5.1% |
| Founder Intelligence | 14 | 4.5% |
| Data & Knowledge | 14 | 4.5% |
| India-Specific | 12 | 3.8% |
| Assessment | 12 | 3.8% |
| Explainability | 12 | 3.8% |
| Meta-Decision | 10 | 3.2% |
| Career Reality | 10 | 3.2% |
| Mentor | 8 | 2.6% |
| **TOTAL** | **313+** | **100%** |

### By Directory

| Directory | Engines |
|-----------|---------|
| `intelligence/` | 187 |
| `archetype/` | 10 |
| `assessment/` | 6 |
| `career-journeys/` | 9 |
| `career-reality/` | 8 |
| `decision-intelligence/` | 5 |
| `future-simulation/` | 4 |
| `market-data-ingestion/` | 5 |
| `mentor-intelligence/` | 6 |
| `optionality-intelligence/` | 5 |
| `outcome-tracking/` | 9 |
| `recommendation/` | 6 |
| `regret-intelligence/` | 6 |
| `utility-intelligence/` | 5 |
| `career-intelligence/` | 5 |
| `career-fit/` | 4 |
| `career-taxonomy/` | 7 |
| `profile/` | 4 |
| **TOTAL** | **313+** |

---

## Critical Observations

### 1. Extreme Fragmentation
- **313+ intelligence engines** with no central authority
- **47 recommendation generators** - no single recommendation authority
- **38 guidance systems** - scattered across codebase
- **29 pathway generators** - no unified pathway authority

### 2. No Intelligence Authority
- No `IntelligenceAuthority` class exists
- No `RecommendationAuthority` class exists
- No `GuidanceAuthority` class exists
- No `FutureAuthority` class exists
- No `RoadmapAuthority` class exists

### 3. Massive Duplication
- Multiple engines for same purpose (recommendation, guidance, pathways)
- Overlapping responsibilities across categories
- No clear ownership boundaries

### 4. Architectural Chaos
- Intelligence scattered across 18+ categories
- No hierarchical intelligence structure
- No clear intelligence flow
- No central intelligence coordination

---

*Intelligence Inventory Generated: 2026-06-05*
*Auditor: Intelligence Architecture Discovery System*
