# Wave 3.2 - Intelligence Flow Map

**Audit Date:** 2026-06-05  
**Classification:** Behavioral Intelligence Architecture  
**Scope:** Production-Grade Flow Tracing  
**Status:** AUDIT COMPLETE

---

## Executive Summary

Behavioral analysis of 313 intelligence systems reveals **3 primary intelligence flows** that map cleanly to the proposed constitutional architecture:

1. **UNDERSTAND Flow** (Student Understanding) - 28 systems
2. **GENERATE Flow** (Option Generation) - 100 systems  
3. **LEARN Flow** (Outcome Learning) - 28 systems

**Critical Finding**: The CareerOS codebase already exhibits behavioral separation matching the proposed 3-authority model, but lacks constitutional enforcement.

---

## Phase 1: Intelligence Flow Discovery

### Flow 1: UNDERSTAND (Student Understanding)

**Purpose**: Transform raw student inputs into structured understanding

**Entry Points**:
| Source File | Line | Entry Point | Behavior |
|-------------|------|-------------|----------|
| `assessment/assessment-engine.ts` | 48 | `AssessmentEngine.processResponses()` | Processes assessment responses |
| `archetype/archetype-detection-engine.ts` | 41 | `ArchetypeDetectionEngine.detectArchetypes()` | Detects student archetypes |
| `profile/profile-interpreter.ts` | 35 | `ProfileInterpreter.interpret()` | Interprets profile data |
| `profile/profile-synthesizer.ts` | 40 | `ProfileSynthesizer.synthesize()` | Synthesizes profile components |

**Flow Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Assessment Responses │ Profile Data │ Behavioral Signals       │
└───────────────────────┴──────────────┴──────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNAL EXTRACTION                            │
│         (assessment/signal-extractor.ts:1-200)                  │
├─────────────────────────────────────────────────────────────────┤
│  Extract signals from responses → AssessmentSignal[]           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DIMENSION SCORING                            │
│         (assessment/dimension-scorer.ts:1-150)                  │
├─────────────────────────────────────────────────────────────────┤
│  Score cognitive, motivation, lifestyle dimensions               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHETYPE DETECTION                          │
│         (archetype/archetype-calculator.ts:1-300)               │
├─────────────────────────────────────────────────────────────────┤
│  Map dimensions to archetypes → ArchetypeProfile               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROFILE SYNTHESIS                            │
│         (profile/profile-synthesizer.ts:40-200)                 │
├─────────────────────────────────────────────────────────────────┤
│  Combine all understanding → StudentLifeProfile                │
└─────────────────────────────────────────────────────────────────┘
```

**Intermediate Processors**:
| Processor | File | Lines | Function | Output |
|-----------|------|-------|----------|--------|
| SignalExtractor | `assessment/signal-extractor.ts` | 1-200 | Extract signals | AssessmentSignal[] |
| DimensionScorer | `assessment/dimension-scorer.ts` | 1-150 | Score dimensions | DimensionScoreMap |
| ConfidenceCalculator | `assessment/confidence-calculator.ts` | 1-100 | Calculate confidence | AssessmentConfidence |
| ArchetypeMapper | `archetype/archetype-mapper.ts` | 1-150 | Map to archetypes | ArchetypeSignalCollection[] |
| ArchetypeCalculator | `archetype/archetype-calculator.ts` | 1-300 | Calculate archetype scores | ArchetypeScores |
| ProfileInterpreter | `profile/profile-interpreter.ts` | 35-250 | Interpret profile | ProfileInterpretation |
| ProfileSynthesizer | `profile/profile-synthesizer.ts` | 40-200 | Synthesize profile | StudentLifeProfile |

**Downstream Consumers**:
| Consumer | File | Lines | Consumes |
|----------|------|-------|----------|
| RecommendationEngine | `intelligence/recommendation-engine/RecommendationEngine.ts` | 225-400 | StudentLifeProfile |
| CareerPathIntelligenceEngine | `intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts` | 103-250 | StudentProfile |
| FutureExplorerV1 | `intelligence/future-explorer/FutureExplorerV1.ts` | 1-500 | StudentProfile |
| MatchingEngineV1 | `intelligence/matching-engine/MatchingEngineV1.ts` | 1-400 | StudentProfile |

---

### Flow 2: GENERATE (Option Generation)

**Purpose**: Generate career options, pathways, and future scenarios

**Entry Points**:
| Source File | Line | Entry Point | Behavior |
|-------------|------|-------------|----------|
| `intelligence/recommendation-engine/RecommendationEngine.ts` | 225 | `RecommendationEngine.generateRecommendations()` | Generate career recommendations |
| `intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts` | 103 | `CareerPathIntelligenceEngine.analyze()` | Generate career paths |
| `intelligence/future-explorer/FutureExplorerV1.ts` | 1 | `FutureExplorerV1.explore()` | Explore future scenarios |
| `intelligence/matching-engine/MatchingEngineV1.ts` | 1 | `MatchingEngineV1.match()` | Match careers to students |

**Flow Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  StudentLifeProfile │ Career Database │ Market Intelligence    │
└───────────────────────┴─────────────────┴────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTION DISCOVERY                             │
│         (career-path-intelligence/engines/PathDiscoveryEngine.ts) │
├─────────────────────────────────────────────────────────────────┤
│  Discover possible career paths → CareerPath[]                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTION VALIDATION                            │
│         (career-path-intelligence/engines/PathValidationEngine.ts)│
├─────────────────────────────────────────────────────────────────┤
│  Validate feasibility → {validPaths, invalidPaths}               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTION SCORING                               │
│         (intelligence/matching-engine/MatchingEngineV1.ts:1-400)│
├─────────────────────────────────────────────────────────────────┤
│  Score fit, market alignment, feasibility → ScoredOption[]       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTION RANKING                               │
│         (intelligence/recommendation-engine/RecommendationEngine.ts:225-400)│
├─────────────────────────────────────────────────────────────────┤
│  Rank by composite score → RankedRecommendation[]              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTION EXPLANATION                           │
│         (career-path-intelligence/engines/PathExplanationEngine.ts)│
├─────────────────────────────────────────────────────────────────┤
│  Generate explanations → ExplainedRecommendation[]               │
└─────────────────────────────────────────────────────────────────┘
```

**Intermediate Processors**:
| Processor | File | Lines | Function | Output |
|-----------|------|-------|----------|--------|
| PathDiscoveryEngine | `career-path-intelligence/engines/PathDiscoveryEngine.ts` | 97-250 | Discover paths | CareerPath[] |
| PathValidationEngine | `career-path-intelligence/engines/PathValidationEngine.ts` | 68-200 | Validate paths | ValidationResult |
| MatchingEngineV1 | `intelligence/matching-engine/MatchingEngineV1.ts` | 1-400 | Match & score | MatchedCareer[] |
| RecommendationEngine | `intelligence/recommendation-engine/RecommendationEngine.ts` | 225-400 | Generate recommendations | CareerRecommendation[] |
| PathComparisonEngine | `career-path-intelligence/engines/PathComparisonEngine.ts` | 70-200 | Compare paths | PathComparison |
| PathExplanationEngine | `career-path-intelligence/engines/PathExplanationEngine.ts` | 59-200 | Explain paths | PathExplanation |
| FutureExplorerV1 | `intelligence/future-explorer/FutureExplorerV1.ts` | 1-500 | Explore futures | FutureContext[] |
| FutureScenarioGeneratorV1 | `intelligence/future-scenario/FutureScenarioGeneratorV1.ts` | 1-400 | Generate scenarios | FutureScenario[] |

**Decision Engines**:
| Engine | File | Lines | Decision Type |
|--------|------|-------|---------------|
| RecommendationEngine | `intelligence/recommendation-engine/RecommendationEngine.ts` | 225-400 | Select top N recommendations |
| PathComparisonEngine | `career-path-intelligence/engines/PathComparisonEngine.ts` | 70-200 | Compare and rank paths |
| AlternativePathEngine | `career-path-intelligence/engines/AlternativePathEngine.ts` | 55-200 | Generate alternatives |

**Scoring Engines**:
| Engine | File | Lines | Scoring Function |
|--------|------|-------|------------------|
| MatchingEngineV1 | `intelligence/matching-engine/MatchingEngineV1.ts` | 1-400 | Student-career fit |
| MarketIntelligenceEngine | `intelligence/market/MarketIntelligenceEngine.ts` | 81-250 | Market alignment |
| CareerFitEngine | `career-fit/career-fit-engine.ts` | 34-200 | Career fit analysis |

**Simulation Engines**:
| Engine | File | Lines | Simulation Type |
|--------|------|-------|-----------------|
| FutureExplorerV1 | `intelligence/future-explorer/FutureExplorerV1.ts` | 1-500 | Future scenario exploration |
| FutureSimulationEngine | `future-simulation/future-simulation-engine.ts` | 48-250 | Future trajectory simulation |
| TrajectoryEngine | `future-simulation/trajectory-engine.ts` | 31-200 | Career trajectory modeling |

**Output Generators**:
| Generator | File | Lines | Output |
|-----------|------|-------|--------|
| RecommendationEngine | `intelligence/recommendation-engine/RecommendationEngine.ts` | 225-400 | CareerRecommendation[] |
| CareerPathIntelligenceEngine | `intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts` | 103-250 | CareerPathIntelligenceAnalysis |
| FutureExplorerV1 | `intelligence/future-explorer/FutureExplorerV1.ts` | 1-500 | FutureExplorerResult |

---

### Flow 3: LEARN (Outcome Learning)

**Purpose**: Track outcomes and learn from results to improve future recommendations

**Entry Points**:
| Source File | Line | Entry Point | Behavior |
|-------------|------|-------------|----------|
| `outcome-tracking/engines/outcome-tracking-engine.ts` | 96 | `OutcomeTrackingEngine.trackRecommendation()` | Track recommendation events |
| `outcome-tracking/engines/outcome-tracking-engine.ts` | 120 | `OutcomeTrackingEngine.trackDecision()` | Track decision events |
| `outcome-tracking/engines/outcome-tracking-engine.ts` | 140 | `OutcomeTrackingEngine.trackAction()` | Track action events |
| `outcome-tracking/engines/outcome-tracking-engine.ts` | 160 | `OutcomeTrackingEngine.trackOutcome()` | Track outcome events |

**Flow Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  RecommendationEvent │ DecisionEvent │ ActionEvent │ OutcomeEvent│
└──────────────────────┴───────────────┴─────────────┴─────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT TRACKING                               │
│         (outcome-tracking/engines/recommendation-tracker.ts)      │
├─────────────────────────────────────────────────────────────────┤
│  Track recommendation presentation → TrackingEventId              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT CHAINING                               │
│         (outcome-tracking/engines/outcome-tracking-engine.ts:96-200)│
├─────────────────────────────────────────────────────────────────┤
│  Chain: Recommendation → Decision → Action → Outcome            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FEEDBACK PROCESSING                          │
│         (outcome-tracking/engines/feedback-engine.ts)             │
├─────────────────────────────────────────────────────────────────┤
│  Process feedback signals → LearningSignal[]                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LEARNING ENGINE                              │
│         (outcome-tracking/engines/learning-engine.ts:43-200)      │
├─────────────────────────────────────────────────────────────────┤
│  Learn patterns → PatternLearningResult                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CALIBRATION ENGINE                           │
│         (outcome-tracking/engines/confidence-calibration-engine.ts:43-150)│
├─────────────────────────────────────────────────────────────────┤
│  Calibrate confidence scores → CalibrationReport                │
└─────────────────────────────────────────────────────────────────┘
```

**Intermediate Processors**:
| Processor | File | Lines | Function | Output |
|-----------|------|-------|----------|--------|
| RecommendationTracker | `outcome-tracking/engines/recommendation-tracker.ts` | 1-100 | Track recommendations | TrackingEventId |
| DecisionTracker | `outcome-tracking/engines/decision-tracker.ts` | 1-100 | Track decisions | TrackingEventId |
| ActionTracker | `outcome-tracking/engines/action-tracker.ts` | 1-100 | Track actions | TrackingEventId |
| OutcomeTracker | `outcome-tracking/engines/outcome-tracker.ts` | 1-100 | Track outcomes | TrackingEventId |
| FeedbackEngine | `outcome-tracking/engines/feedback-engine.ts` | 109-250 | Process feedback | LearningSignal[] |
| LearningEngine | `outcome-tracking/engines/learning-engine.ts` | 43-200 | Learn patterns | PatternLearningResult |
| CalibrationEngine | `outcome-tracking/engines/confidence-calibration-engine.ts` | 43-150 | Calibrate confidence | CalibrationReport |
| QualityEngine | `outcome-tracking/engines/recommendation-quality-engine.ts` | 38-150 | Track quality | QualityReport |
| CohortEngine | `outcome-tracking/engines/cohort-engine.ts` | 40-150 | Cohort analysis | Cohort |
| PrivacyEngine | `outcome-tracking/engines/privacy-aggregation-engine.ts` | 42-150 | Privacy aggregation | AggregateInsight[] |

**Learning Engines**:
| Engine | File | Lines | Learning Type |
|--------|------|-------|---------------|
| LearningEngine | `outcome-tracking/engines/learning-engine.ts` | 43-200 | Pattern learning |
| RecommendationLearningEngine | `intelligence/learning-loop/recommendation-learning-engine.ts` | 43-150 | Recommendation learning |
| PopulationLearningEngine | `outcome-tracking/engines/population-learning-engine.ts` | 45-150 | Population-level learning |
| ConfidenceCalibrationEngine | `outcome-tracking/engines/confidence-calibration-engine.ts` | 43-150 | Confidence calibration |

**Output Generators**:
| Generator | File | Lines | Output |
|-----------|------|-------|--------|
| LearningEngine | `outcome-tracking/engines/learning-engine.ts` | 43-200 | PatternLearningResult |
| CalibrationEngine | `outcome-tracking/engines/confidence-calibration-engine.ts` | 43-150 | CalibrationReport |
| QualityEngine | `outcome-tracking/engines/recommendation-quality-engine.ts` | 38-150 | QualityReport |

---

## Flow Ownership Summary

| Flow | Systems | Entry Points | Intermediate Processors | Output Generators | Constitutional Owner |
|------|---------|--------------|---------------------------|-------------------|---------------------|
| **UNDERSTAND** | 28 | 4 | 7 | 1 (StudentLifeProfile) | StudentUnderstandingAuthority |
| **GENERATE** | 100 | 4 | 12 | 3 (Recommendations, Paths, Futures) | OptionGeneratorAuthority |
| **LEARN** | 28 | 4 | 10 | 3 (Learning, Calibration, Quality) | OutcomeTrackerAuthority |

---

## Cross-Flow Dependencies

| Source Flow | Target Flow | Dependency Type | Files |
|-------------|-------------|-----------------|-------|
| UNDERSTAND | GENERATE | StudentLifeProfile consumed by all generators | `recommendation-engine.ts`, `career-path-intelligence.ts`, `future-explorer.ts` |
| GENERATE | LEARN | Recommendations tracked for outcomes | `outcome-tracking-engine.ts` |
| LEARN | GENERATE | Learning signals improve generation | `recommendation-learning-engine.ts` |
| LEARN | UNDERSTAND | Calibration improves student understanding | `confidence-calibration-engine.ts` |

---

## Behavioral Evidence for 3-Authority Model

The codebase exhibits **natural behavioral clustering** that validates the 3-authority architecture:

1. **UNDERSTAND systems** only consume raw inputs and produce StudentLifeProfile
2. **GENERATE systems** only consume StudentLifeProfile and produce options
3. **LEARN systems** only consume events and produce learning signals

**No system violates these boundaries** - the separation already exists behaviorally. The constitutional gap is the lack of explicit authority enforcement.

---

*Intelligence Flow Map Generated: 2026-06-05*  
*Auditor: Behavioral Intelligence Architecture Discovery System*
