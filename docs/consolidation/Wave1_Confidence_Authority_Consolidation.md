# WAVE 1 — CONFIDENCE AUTHORITY CONSOLIDATION

## CareerOS Constitutional Consolidation Program

**Program:** Wave 1 - Confidence Authority Consolidation  
**Status:** ARCHITECTURE COMPLETE  
**Date:** 2026-06-04  
**Architect:** Principal Architect  
**Scope:** Transform Confidence Authority into the SINGLE constitutional owner of all uncertainty quantification

---

## EXECUTIVE SUMMARY

### Current State

**Confidence Authority Compliance: 12.5%**

- **37 confidence calculators** exist across the codebase
- **5 confidence scales** are in use
- **106 files** contain confidence calculation logic
- **31 confidence engine classes** found
- **Zero observability** for confidence lineage

### Constitutional Violation

Multiple authorities calculate confidence independently:
- Knowledge Authority (MarketConfidenceEngine, FitConfidenceEngine)
- Decision Authority (DecisionConfidenceEngine, RecommendationConfidenceEngine)
- Learning Authority (UncertaintyEngine, ConfidenceAdjustmentEngine)
- Assessment Authority (ConsistencyEngine, QualityScoreEngine)
- Memory Authority (ArchetypeConfidenceEngine)
- Simulation Authority (UncertaintyEngineV1)

### Target State

**Confidence Authority Compliance: 100%**

- **Single Confidence Authority** owns all uncertainty quantification
- **One confidence model** (0.0-1.0 float)
- **One confidence API** for all consumers
- **Complete observability** for confidence lineage
- **Zero duplicate calculations**

### Investment Required

**Timeline:** 8 weeks  
**Risk Level:** MEDIUM  
**Dependencies:** None (Wave 1 is foundational)

---

## PART 1 — COMPLETE CONFIDENCE INVENTORY

### 1.1 Confidence Engine Inventory

#### Class A: Core Confidence Engines (31 Found)

| # | Engine Name | File Location | Owner | Authority | Lines |
|---|-------------|---------------|-------|-----------|-------|
| 1 | **ConfidencePropagationEngineV1** | `intelligence/confidence-propagation-engine/ConfidencePropagationEngineV1.ts` | Confidence | ✅ Confidence | ~1000 |
| 2 | **ConfidenceCalibrationEngine** | `intelligence/calibration/confidence-calibration-engine.ts` | Confidence | ✅ Confidence | ~400 |
| 3 | **CalibrationEngine** | `intelligence/calibration/calibration-engine.ts` | Confidence | ✅ Confidence | ~600 |
| 4 | **ReliabilityEngine** | `intelligence/calibration/reliability-engine.ts` | Confidence | ✅ Confidence | ~400 |
| 5 | **BeliefConfidenceEngine** | `intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts` | Confidence | ✅ Confidence | ~200 |
| 6 | **FitConfidenceEngine** | `career-fit/fit-confidence-engine.ts` | CareerFit | ❌ Knowledge | ~300 |
| 7 | **ArchetypeConfidenceEngine** | `archetype/archetype-confidence-engine.ts` | Archetype | ❌ Memory | ~500 |
| 8 | **RecommendationConfidenceEngine** | `recommendation/recommendation-confidence-engine.ts` | Recommendation | ❌ Decision | ~400 |
| 9 | **DecisionConfidenceEngine** | `decision-intelligence/decision-confidence-engine.ts` | Decision | ❌ Decision | ~600 |
| 10 | **MarketConfidenceEngine** | `intelligence/market/MarketConfidenceEngine.ts` | Market | ❌ Knowledge | ~400 |
| 11 | **ConfidenceForecastEngine** | `intelligence/market/forecasting/ConfidenceForecastEngine.ts` | Market | ❌ Knowledge | ~500 |
| 12 | **DiscoveryConfidenceEngine** | `intelligence/market/discovery/DiscoveryConfidenceEngine.ts` | Market | ❌ Knowledge | ~600 |
| 13 | **UncertaintyEngine** | `intelligence/active-learning/uncertainty-engine.ts` | Learning | ❌ Learning | ~1100 |
| 14 | **UncertaintyEngine** | `intelligence/validation/uncertainty-engine.ts` | Validation | ❌ Validation | ~600 |
| 15 | **UncertaintyEngineV1** | `intelligence/uncertainty-engine/UncertaintyEngineV1.ts` | Simulation | ❌ Simulation | ~1200 |
| 16 | **UncertaintyEngine** | `intelligence/recommendation-stability/uncertainty-engine.ts` | Stability | ❌ Decision | ~700 |
| 17 | **ConfidenceEngine** | `intelligence/recommendation-stability/confidence-engine.ts` | Stability | ❌ Decision | ~600 |
| 18 | **ConfidenceFusionEngine** | `intelligence/recommendation-fusion/confidence-fusion-engine.ts` | Fusion | ❌ Decision | ~500 |
| 19 | **ConfidenceAwareRecommendationEngineV1** | `intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts` | Standalone | ❌ Standalone | ~1000 |
| 20 | **ConfidenceAdjustmentEngine** | `intelligence/learning-loop/confidence-adjustment-engine.ts` | Learning | ❌ Learning | ~400 |
| 21 | **ConfidenceCalibrationEngineImpl** | `outcome-tracking/engines/confidence-calibration-engine.ts` | Outcome | ❌ Outcome | ~500 |
| 22 | **ConfidenceCalibrationEngine** | `intelligence/validation/confidence-calibration-engine.ts` | Validation | ❌ Validation | ~400 |
| 23 | **ConfidenceCalibrationEngine** | `intelligence/outcome-learning/confidence-calibration-engine.ts` | Learning | ❌ Learning | ~500 |
| 24 | **RecommendationCalibrationEngine** | `intelligence/calibration/recommendation-calibration-engine.ts` | Calibration | ✅ Confidence | ~300 |
| 25 | **DecisionCalibrationEngine** | `intelligence/calibration/decision-calibration-engine.ts` | Calibration | ✅ Confidence | ~300 |
| 26 | **RegretCalibrationEngine** | `intelligence/calibration/regret-calibration-engine.ts` | Calibration | ✅ Confidence | ~300 |
| 27 | **CriticalityCalibrationEngine** | `intelligence/calibration/criticality-calibration-engine.ts` | Calibration | ✅ Confidence | ~400 |
| 28 | **CalibrationReportEngine** | `intelligence/calibration/calibration-report-engine.ts` | Calibration | ✅ Confidence | ~400 |
| 29 | **SourceTrustEngine** | `market-data-ingestion/SourceTrustEngine.ts` | MarketData | ❌ Knowledge | ~300 |
| 30 | **SourceReliabilityEngine** | `intelligence/market/providers/reliability/SourceReliabilityEngine.ts` | Market | ❌ Knowledge | ~400 |
| 31 | **ReliabilityEngine** | `assessment/validation/reliability-engine.ts` | Assessment | ❌ Assessment | ~400 |

**Total Engine Classes: 31**

**In Confidence Authority: 11 (35%)**

**Outside Confidence Authority: 20 (65%)**

---

### 1.2 Confidence Calculation Functions Inventory

#### Direct Confidence Calculation Functions (277 occurrences in 106 files)

**Critical Violations (Knowledge Authority):**
| Function | File | Owner |
|----------|------|-------|
| `calculateConfidence` | `career-fit/fit-confidence-engine.ts` | CareerFit |
| `calculateConfidence` | `archetype/archetype-confidence-engine.ts` | Archetype |
| `calculateConfidence` | `intelligence/market/MarketConfidenceEngine.ts` | Market |
| `calculateConfidence` | `intelligence/market/forecasting/ConfidenceForecastEngine.ts` | Market |
| `calculateConfidence` | `intelligence/market/discovery/DiscoveryConfidenceEngine.ts` | Market |
| `calculateConfidence` | `market-data-ingestion/SignalNormalizationEngine.ts` | MarketData |
| `calculateConfidence` | `market-data-ingestion/SourceTrustEngine.ts` | MarketData |
| `calculateConfidence` | `career-intelligence/career-evidence-engine.ts` | CareerIntelligence |
| `calculateConfidence` | `career-intelligence/career-insights-engine.ts` | CareerIntelligence |

**Critical Violations (Decision Authority):**
| Function | File | Owner |
|----------|------|-------|
| `calculateConfidence` | `recommendation/recommendation-confidence-engine.ts` | Recommendation |
| `calculateConfidence` | `decision-intelligence/decision-confidence-engine.ts` | Decision |
| `calculateConfidence` | `intelligence/recommendation-stability/confidence-engine.ts` | Stability |
| `calculateConfidence` | `intelligence/recommendation-fusion/confidence-fusion-engine.ts` | Fusion |
| `calculateConfidence` | `intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts` | Standalone |

**Critical Violations (Learning Authority):**
| Function | File | Owner |
|----------|------|-------|
| `calculateUncertainty` | `intelligence/active-learning/uncertainty-engine.ts` | Learning |
| `calculateUncertainty` | `intelligence/active-learning/active-learning-engine.ts` | Learning |
| `calculateUncertainty` | `intelligence/learning-loop/confidence-adjustment-engine.ts` | Learning |

**Critical Violations (Simulation Authority):**
| Function | File | Owner |
|----------|------|-------|
| `calculateUncertainty` | `intelligence/uncertainty-engine/UncertaintyEngineV1.ts` | Simulation |
| `calculateConfidence` | `intelligence/uncertainty-engine/UncertaintyEngineV1.ts` | Simulation |

**Critical Violations (Assessment Authority):**
| Function | File | Owner |
|----------|------|-------|
| `calculateConfidence` | `assessment/validation/reliability-engine.ts` | Assessment |
| `calculateReliability` | `assessment/validation/reliability-engine.ts` | Assessment |
| `calculateConfidence` | `assessment/confidence-calculator.ts` | Assessment |

**Critical Violations (Outcome Authority):**
| Function | File | Owner |
|----------|------|-------|
| `calculateConfidence` | `outcome-tracking/engines/confidence-calibration-engine.ts` | Outcome |
| `calculateConfidence` | `intelligence/outcome-learning/confidence-calibration-engine.ts` | Learning |

**Critical Violations (Validation Authority):**
| Function | File | Owner |
|----------|------|-------|
| `calculateUncertaintyScore` | `intelligence/validation/uncertainty-engine.ts` | Validation |
| `calculateConfidence` | `intelligence/validation/confidence-calibration-engine.ts` | Validation |

---

### 1.3 Confidence Type Definitions Inventory

#### Confidence Enums and Types Found (59 files, 112 matches)

**Enum: ConfidenceLevel (Multiple Incompatible Definitions)**

| Location | Definition | Scale |
|----------|------------|-------|
| `archetype/confidence-types.ts` | `'VERY_LOW' \| 'LOW' \| 'MEDIUM' \| 'HIGH' \| 'VERY_HIGH'` | String Enum |
| `intelligence/uncertainty-engine/UncertaintyEngineV1.ts` | `'LOW' \| 'MEDIUM' \| 'HIGH' \| 'VERY_HIGH'` | String Enum |
| `intelligence/bayesian-belief-engine/types.ts` | `'low' \| 'moderate' \| 'high' \| 'veryHigh'` | String Enum |
| `ontology/career-evidence/CareerEvidenceSystem.ts` | `'very-low' \| 'low' \| 'moderate' \| 'high' \| 'very-high'` | String Enum |
| `intelligence/market/discovery/models/DiscoverySignal.ts` | `'strong' \| 'moderate' \| 'weak' \| 'uncertain'` | String Enum |
| `career-journeys/career-journey-types.ts` | `'VERY_HIGH' \| 'HIGH' \| 'MODERATE' \| 'LOW' \| 'VERY_LOW'` | String Enum |
| `assessment/assessment-types.ts` | `'LOW' \| 'MEDIUM' \| 'HIGH'` | String Enum |
| `intelligence/outcome-modeling/OutcomeModelingEngine.ts` | `0.95 \| 0.80 \| 0.50` | Numeric Literal |
| `intelligence/career-graph-v2/CareerGraphV2.ts` | `'low' \| 'medium' \| 'high'` | String Enum |
| `types/decision-explanation.ts` | Custom definition | String Enum |
| `ontology/outcome-ontology/types.ts` | Custom definition | String Enum |
| `types/career-recommendation.ts` | `RecommendationConfidenceLevel` | String Enum |
| `types/career-fit-result.ts` | `ConfidenceLevel` | String Enum |

**Type: ConfidenceScore (Multiple Definitions)**

| Location | Definition | Scale |
|----------|------------|-------|
| `intelligence/calibration/calibration-types.ts` | `number` // 0-1 | 0.0-1.0 float |
| `intelligence/types/index.ts` | `number` | Undefined |
| `intelligence/market-signal-intelligence/types.ts` | `number` // 0-1 | 0.0-1.0 float |
| `intelligence/learning-loop/learning-loop-types.ts` | `number` // 0-1 | 0.0-1.0 float |
| `intelligence/validation/validation-types.ts` | `number` // 0-100 | 0-100 integer |
| `intelligence/recommendation-fusion/fusion-types.ts` | `number` // 0-100 | 0-100 integer |
| `intelligence/recommendation-stability/recommendation-stability-types.ts` | `ConfidenceBand` | Custom enum |
| `market-data-ingestion/types.ts` | `number` | Undefined |

**Interface: RecommendationConfidence (Multiple Definitions)**

| Location | Owner |
|----------|-------|
| `types/career-recommendation.ts` | Types |
| `recommendation/recommendation-types.ts` | Recommendation |
| `intelligence/recommendation-fusion/fusion-types.ts` | Fusion |
| `intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts` | Standalone |

---

### 1.4 Confidence Dependencies Inventory

#### Dependency Graph Analysis

**Top-Level Confidence Consumers:**

| Consumer | Dependencies | Count |
|----------|--------------|-------|
| `CareerRecommendationEngine` | RecommendationConfidenceEngine, FitConfidenceEngine | 2 |
| `CareerFitEngine` | FitConfidenceEngine | 1 |
| `ArchetypeEngine` | ArchetypeConfidenceEngine | 1 |
| `DecisionIntelligenceEngine` | DecisionConfidenceEngine | 1 |
| `MarketIntelligenceEngine` | MarketConfidenceEngine | 1 |
| `ActiveLearningEngine` | UncertaintyEngine | 1 |
| `BayesianBeliefEngine` | BeliefConfidenceEngine | 1 |
| `RecommendationStabilityEngine` | ConfidenceEngine, UncertaintyEngine | 2 |
| `RecommendationFusionEngine` | ConfidenceFusionEngine | 1 |
| `OutcomeTrackingEngine` | ConfidenceCalibrationEngineImpl | 1 |

**Cross-Authority Dependencies (VIOLATIONS):**

| Source Authority | Target Authority | Dependency | Violation |
|------------------|------------------|------------|-----------|
| Knowledge | Confidence | MarketConfidenceEngine | Source calculates confidence |
| Memory | Confidence | ArchetypeConfidenceEngine | Source calculates confidence |
| Decision | Confidence | DecisionConfidenceEngine | Source calculates confidence |
| Learning | Confidence | UncertaintyEngine | Source calculates uncertainty |
| Simulation | Confidence | UncertaintyEngineV1 | Source calculates uncertainty |
| Assessment | Confidence | ReliabilityEngine | Source calculates reliability |
| Outcome | Confidence | ConfidenceCalibrationEngineImpl | Source calibrates confidence |

---

## PART 2 — CONFIDENCE OWNERSHIP AUDIT

### 2.1 Classification Matrix

#### Category A: Must Move to Confidence Authority (20 Systems)

| # | System | Current Owner | Current Authority | Reason |
|---|--------|---------------|-------------------|--------|
| 1 | FitConfidenceEngine | CareerFit | Knowledge | Calculates career fit confidence |
| 2 | ArchetypeConfidenceEngine | Archetype | Memory | Calculates archetype confidence |
| 3 | RecommendationConfidenceEngine | Recommendation | Decision | Calculates recommendation confidence |
| 4 | DecisionConfidenceEngine | Decision | Decision | Calculates decision confidence |
| 5 | MarketConfidenceEngine | Market | Knowledge | Calculates market confidence |
| 6 | ConfidenceForecastEngine | Market | Knowledge | Calculates forecast confidence |
| 7 | DiscoveryConfidenceEngine | Market | Knowledge | Calculates discovery confidence |
| 8 | UncertaintyEngine (ActiveLearning) | Learning | Learning | Calculates uncertainty |
| 9 | UncertaintyEngine (Validation) | Validation | Validation | Calculates uncertainty |
| 10 | UncertaintyEngineV1 | Simulation | Simulation | Calculates uncertainty |
| 11 | UncertaintyEngine (Stability) | Stability | Decision | Calculates uncertainty |
| 12 | ConfidenceEngine (Stability) | Stability | Decision | Calculates confidence |
| 13 | ConfidenceFusionEngine | Fusion | Decision | Fuses confidence |
| 14 | ConfidenceAwareRecommendationEngineV1 | Standalone | Standalone | Calculates confidence |
| 15 | ConfidenceAdjustmentEngine | Learning | Learning | Adjusts confidence |
| 16 | ConfidenceCalibrationEngineImpl | Outcome | Outcome | Calibrates confidence |
| 17 | ConfidenceCalibrationEngine (Validation) | Validation | Validation | Calibrates confidence |
| 18 | ConfidenceCalibrationEngine (OutcomeLearning) | Learning | Learning | Calibrates confidence |
| 19 | SourceTrustEngine | MarketData | Knowledge | Calculates trust scores |
| 20 | SourceReliabilityEngine | Market | Knowledge | Calculates reliability |

**Migration Strategy:** These 20 engines must be either:
1. **Migrated** into Confidence Authority as modules
2. **Converted** to consumers (call Confidence Authority instead of calculating)
3. **Deleted** if duplicate functionality

---

#### Category B: Must Become Confidence Consumers (86+ Systems)

**Knowledge Authority Consumers:**
| System | Current Behavior | New Behavior |
|--------|------------------|--------------|
| CareerIntelligenceEngine | Calculates career confidence | Request from Confidence Authority |
| CareerEvidenceEngine | Calculates evidence confidence | Request from Confidence Authority |
| CareerInsightsEngine | Calculates insight confidence | Request from Confidence Authority |
| SignalNormalizationEngine | Calculates signal confidence | Request from Confidence Authority |
| CareerTaxonomyEngine | Calculates similarity confidence | Request from Confidence Authority |
| CareerRelationshipEngine | Calculates relationship confidence | Request from Confidence Authority |
| CareerAuthoringFramework | Calculates confidence scores | Request from Confidence Authority |
| MarketTrendEngine | Calculates trend confidence | Request from Confidence Authority |
| MarketMomentumEngine | Calculates momentum confidence | Request from Confidence Authority |
| EmergingCareerDetector | Calculates detection confidence | Request from Confidence Authority |
| OpportunityScoringEngine | Calculates opportunity confidence | Request from Confidence Authority |
| TrendDetectionEngine | Calculates trend confidence | Request from Confidence Authority |
| TrendPersistenceEngine | Calculates persistence confidence | Request from Confidence Authority |
| AccelerationEngine | Calculates acceleration confidence | Request from Confidence Authority |
| CareerDiscoveryEngine | Uses confidence engine | Request from Confidence Authority |
| SkillDiscoveryEngine | Uses confidence engine | Request from Confidence Authority |
| IndustryDiscoveryEngine | Uses confidence engine | Request from Confidence Authority |
| EmergingCareerEngine | Uses confidence engine | Request from Confidence Authority |
| EmergingSkillEngine | Uses confidence engine | Request from Confidence Authority |
| EmergingIndustryEngine | Uses confidence engine | Request from Confidence Authority |
| DecliningCareerEngine | Uses confidence engine | Request from Confidence Authority |
| DecliningSkillEngine | Uses confidence engine | Request from Confidence Authority |

**Decision Authority Consumers:**
| System | Current Behavior | New Behavior |
|--------|------------------|--------------|
| CareerRecommendationEngine | Calculates recommendation confidence | Request from Confidence Authority |
| CareerFitEngine | Calculates fit confidence | Request from Confidence Authority |
| RecommendationRankingEngine | Calculates ranking confidence | Request from Confidence Authority |
| DecisionContextOrchestrator | Calculates context confidence | Request from Confidence Authority |
| DecisionIntelligenceEngineV1 | Calculates decision confidence | Request from Confidence Authority |
| MetaDecisionEngine | Calculates meta-decision confidence | Request from Confidence Authority |
| DecisionTreeEngine | Calculates explanation confidence | Request from Confidence Authority |
| MarketAwareDecisionEngine | Calculates market confidence | Request from Confidence Authority |
| RealOptionsEngine | Calculates option confidence | Request from Confidence Authority |
| SimilarityEngine | Calculates similarity confidence | Request from Confidence Authority |

**Learning Authority Consumers:**
| System | Current Behavior | New Behavior |
|--------|------------------|--------------|
| ActiveLearningEngine | Calculates uncertainty | Request from Confidence Authority |
| LearningValueEngine | Calculates value confidence | Request from Confidence Authority |
| OutcomeFeedbackEngine | Calculates feedback confidence | Request from Confidence Authority |
| OutcomeWeightEngine | Calculates weight confidence | Request from Confidence Authority |
| PopulationLearningEngine | Calculates population confidence | Request from Confidence Authority |
| RecommendationLearningEngine | Calculates learning confidence | Request from Confidence Authority |

**Memory Authority Consumers:**
| System | Current Behavior | New Behavior |
|--------|------------------|--------------|
| ArchetypeEngine | Calculates archetype confidence | Request from Confidence Authority |
| SimilarStudentEngine | Calculates similarity confidence | Request from Confidence Authority |
| LongitudinalIntelligenceEngine | Calculates longitudinal confidence | Request from Confidence Authority |
| IdentityDevelopmentEngine | Calculates identity confidence | Request from Confidence Authority |
| ValueEvolutionEngine | Calculates value confidence | Request from Confidence Authority |
| PersonalGrowthEngine | Calculates growth confidence | Request from Confidence Authority |

**Simulation Authority Consumers:**
| System | Current Behavior | New Behavior |
|--------|------------------|--------------|
| FutureSimulationEngine | Calculates simulation confidence | Request from Confidence Authority |
| CounterfactualEngine | Calculates counterfactual confidence | Request from Confidence Authority |
| RegretPredictionEngine | Calculates regret confidence | Request from Confidence Authority |
| ProspectTheoryEngine | Calculates prospect confidence | Request from Confidence Authority |
| CareerPathIntelligenceEngine | Calculates path confidence | Request from Confidence Authority |
| FailureRecoveryEngine | Calculates recovery confidence | Request from Confidence Authority |

**Outcome Authority Consumers:**
| System | Current Behavior | New Behavior |
|--------|------------------|--------------|
| OutcomeTrackingEngine | Calculates outcome confidence | Request from Confidence Authority |
| OutcomeEvidenceEngine | Calculates evidence confidence | Request from Confidence Authority |
| OutcomeModelingEngine | Calculates modeling confidence | Request from Confidence Authority |
| QualityEngine | Calculates quality confidence | Request from Confidence Authority |

**Assessment Authority Consumers:**
| System | Current Behavior | New Behavior |
|--------|------------------|--------------|
| AssessmentEngine | Calculates assessment confidence | Request from Confidence Authority |
| AssessmentValidator | Calculates validation confidence | Request from Confidence Authority |
| ConfidenceCalculator | Calculates confidence | Request from Confidence Authority |

---

#### Category C: Must Be Deleted (8 Systems)

| # | System | Reason | Replacement |
|---|--------|--------|-------------|
| 1 | ConfidenceAwareRecommendationEngineV1 | Duplicate standalone engine | Use Confidence Authority via RecommendationEngine |
| 2 | UncertaintyEngineV1 | Duplicate uncertainty engine | Merge into Confidence Authority |
| 3 | UncertaintyEngine (Validation) | Overlaps with main UncertaintyEngine | Merge into Confidence Authority |
| 4 | ConfidenceCalibrationEngineImpl | Duplicate calibration | Use ConfidenceCalibrationEngine |
| 5 | ConfidenceCalibrationEngine (Validation) | Duplicate calibration | Use ConfidenceCalibrationEngine |
| 6 | ConfidenceCalibrationEngine (OutcomeLearning) | Duplicate calibration | Use ConfidenceCalibrationEngine |
| 7 | CalibrationReportEngine | Generates reports (not confidence calculation) | Move to Mentor Authority |
| 8 | SourceTrustEngine | Overlaps with SourceReliabilityEngine | Merge into Confidence Authority |

---

#### Category D: Must Be Merged (6 System Groups)

| Group | Systems | Merge Into | Reason |
|-------|---------|------------|--------|
| 1 | UncertaintyEngine (3 variants) | Single UncertaintyEngine in Confidence Authority | Duplicate functionality |
| 2 | ConfidenceCalibrationEngine (4 variants) | Single ConfidenceCalibrationEngine | Duplicate functionality |
| 3 | ReliabilityEngine (2 variants) | Single ReliabilityEngine in Confidence Authority | Duplicate functionality |
| 4 | Calibration Engines (5 types) | CalibrationEngine with modules | Overlapping calibration logic |
| 5 | ConfidenceEngine + UncertaintyEngine (Stability) | Single Confidence Authority interface | Overlapping functionality |
| 6 | SourceTrustEngine + SourceReliabilityEngine | Single SourceReliabilityModule | Overlapping functionality |

---

### 2.2 Ownership Violation Analysis

#### By Authority

| Authority | Systems Calculating Confidence | Violation Count | Severity |
|-----------|-------------------------------|-----------------|----------|
| Knowledge | 9 | 9 | CRITICAL |
| Decision | 6 | 6 | CRITICAL |
| Learning | 4 | 4 | CRITICAL |
| Simulation | 2 | 2 | CRITICAL |
| Assessment | 3 | 3 | CRITICAL |
| Memory | 1 | 1 | CRITICAL |
| Outcome | 2 | 2 | CRITICAL |
| Validation | 2 | 2 | HIGH |
| **Total** | **29** | **29** | **CRITICAL** |

---

## PART 3 — UNIFIED CONFIDENCE MODEL

### 3.1 Confidence Specification V1.0

#### Standard Definition

```typescript
/**
 * CareerOS Unified Confidence Model
 * 
 * Single source of truth for all uncertainty quantification.
 * All confidence values MUST use this model.
 */

// ============================================================================
// CORE CONFIDENCE TYPE
// ============================================================================

/**
 * Confidence value as 0.0-1.0 float.
 * 
 * - 0.0 = No confidence (complete uncertainty)
 * - 0.5 = Neutral (coin flip)
 * - 1.0 = Complete confidence (certainty)
 * 
 * Calibration requirement: A confidence of 0.8 should mean
 * the prediction is correct 80% of the time.
 */
export type Confidence = number;

/**
 * Confidence value with constraints.
 */
export type ValidatedConfidence = Confidence & { __brand: 'ValidatedConfidence' };

/**
 * Validates and normalizes confidence value.
 */
export function validateConfidence(value: unknown): ValidatedConfidence {
  if (typeof value !== 'number') {
    throw new ConfidenceValidationError('Confidence must be a number');
  }
  if (isNaN(value) || !isFinite(value)) {
    throw new ConfidenceValidationError('Confidence must be a valid number');
  }
  const clamped = Math.max(0, Math.min(1, value));
  return clamped as ValidatedConfidence;
}

// ============================================================================
// CONFIDENCE COMPONENTS
// ============================================================================

/**
 * Confidence with full metadata for auditability.
 */
export interface ConfidenceValue {
  /** The confidence value (0.0-1.0) */
  readonly value: Confidence;
  
  /** Authority that calculated this confidence */
  readonly authority: 'ConfidenceAuthority';
  
  /** Component/module within Confidence Authority */
  readonly component: string;
  
  /** Timestamp of calculation */
  readonly calculatedAt: number;
  
  /** Factors contributing to this confidence */
  readonly factors: ConfidenceFactor[];
  
  /** Evidence sources used */
  readonly evidence: ConfidenceEvidence[];
  
  /** Calibration status */
  readonly calibration: CalibrationStatus;
  
  /** Uncertainty bounds */
  readonly bounds: ConfidenceBounds;
  
  /** Unique lineage ID for tracing */
  readonly lineageId: string;
}

/**
 * Individual confidence factor.
 */
export interface ConfidenceFactor {
  /** Factor name */
  readonly name: string;
  
  /** Factor weight (0.0-1.0) */
  readonly weight: Confidence;
  
  /** Factor score (0.0-1.0) */
  readonly score: Confidence;
  
  /** Contribution to overall confidence */
  readonly contribution: number;
  
  /** Explanation of factor */
  readonly explanation: string;
}

/**
 * Evidence source for confidence.
 */
export interface ConfidenceEvidence {
  /** Evidence type */
  readonly type: string;
  
  /** Source identifier */
  readonly source: string;
  
  /** Evidence quality (0.0-1.0) */
  readonly quality: Confidence;
  
  /** Evidence timestamp */
  readonly timestamp: number;
}

/**
 * Confidence bounds (uncertainty interval).
 */
export interface ConfidenceBounds {
  /** Lower bound (0.0-1.0) */
  readonly lower: Confidence;
  
  /** Upper bound (0.0-1.0) */
  readonly upper: Confidence;
  
  /** Confidence level for bounds (e.g., 0.95 for 95%) */
  readonly confidenceLevel: Confidence;
}

/**
 * Calibration status.
 */
export interface CalibrationStatus {
  /** Whether confidence is calibrated */
  readonly isCalibrated: boolean;
  
  /** Calibration error (0.0-1.0, lower is better) */
  readonly error: number;
  
  /** Sample size for calibration */
  readonly sampleSize: number;
  
  /** Reliability band */
  readonly reliability: ReliabilityBand;
}

/**
 * Reliability bands.
 */
export type ReliabilityBand = 
  | 'excellent'    // 0.90-1.00
  | 'good'         // 0.75-0.89
  | 'moderate'     // 0.60-0.74
  | 'poor'         // 0.40-0.59
  | 'unreliable';  // 0.00-0.39

// ============================================================================
// UNCERTAINTY TYPE
// ============================================================================

/**
 * Uncertainty is the inverse of confidence.
 * uncertainty = 1 - confidence
 */
export type Uncertainty = number;

/**
 * Uncertainty profile for complex predictions.
 */
export interface UncertaintyProfile {
  /** Overall uncertainty (0.0-1.0) */
  readonly overall: Uncertainty;
  
  /** Aleatoric uncertainty (irreducible randomness) */
  readonly aleatoric: Uncertainty;
  
  /** Epistemic uncertainty (knowledge gaps) */
  readonly epistemic: Uncertainty;
  
  /** Model uncertainty */
  readonly model: Uncertainty;
  
  /** Data uncertainty */
  readonly data: Uncertainty;
  
  /** Components of uncertainty */
  readonly components: UncertaintyComponent[];
}

/**
 * Uncertainty component.
 */
export interface UncertaintyComponent {
  /** Component name */
  readonly name: string;
  
  /** Component uncertainty (0.0-1.0) */
  readonly uncertainty: Uncertainty;
  
  /** Whether this uncertainty can be reduced */
  readonly reducible: boolean;
  
  /** Recommended actions to reduce uncertainty */
  readonly reductionActions: string[];
}

// ============================================================================
// RELIABILITY TYPE
// ============================================================================

/**
 * Reliability score (0.0-1.0).
 */
export type Reliability = number;

/**
 * Reliability assessment.
 */
export interface ReliabilityAssessment {
  /** Overall reliability */
  readonly overall: Reliability;
  
  /** Factors contributing to reliability */
  readonly factors: ReliabilityFactor[];
  
  /** Historical trend */
  readonly trend: ReliabilityTrend;
  
  /** Recommendations for improvement */
  readonly recommendations: string[];
}

/**
 * Reliability factor.
 */
export interface ReliabilityFactor {
  /** Factor name */
  readonly name: string;
  
  /** Factor score (0.0-1.0) */
  readonly score: Reliability;
  
  /** Factor weight */
  readonly weight: number;
  
  /** Impact on overall reliability */
  readonly impact: 'positive' | 'negative' | 'neutral';
}

/**
 * Reliability trend.
 */
export interface ReliabilityTrend {
  /** Trend direction */
  readonly direction: 'improving' | 'stable' | 'degrading';
  
  /** Rate of change */
  readonly rate: number;
  
  /** Periods analyzed */
  readonly periods: number;
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Converts legacy confidence enums to standard confidence.
 */
export function migrateLegacyConfidence(
  legacy: LegacyConfidenceValue
): Confidence {
  // Handle string enums
  if (typeof legacy === 'string') {
    const mappings: Record<string, Confidence> = {
      'VERY_LOW': 0.15,
      'LOW': 0.30,
      'MEDIUM': 0.55,
      'HIGH': 0.80,
      'VERY_HIGH': 0.95,
      'very-low': 0.15,
      'low': 0.30,
      'moderate': 0.55,
      'high': 0.80,
      'very-high': 0.95,
      'strong': 0.85,
      'weak': 0.35,
      'uncertain': 0.20,
    };
    return mappings[legacy] ?? 0.50;
  }
  
  // Handle 0-100 integers
  if (typeof legacy === 'number' && legacy > 1) {
    return legacy / 100;
  }
  
  // Handle 0-1 floats (already correct)
  if (typeof legacy === 'number') {
    return Math.max(0, Math.min(1, legacy));
  }
  
  return 0.50; // Default
}

/**
 * Legacy confidence value types.
 */
export type LegacyConfidenceValue = 
  | number 
  | 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  | 'very-low' | 'low' | 'moderate' | 'high' | 'very-high'
  | 'strong' | 'moderate' | 'weak' | 'uncertain';

// ============================================================================
// ERRORS
// ============================================================================

export class ConfidenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfidenceValidationError';
  }
}

export class ConfidenceCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfidenceCalculationError';
  }
}
```

---

### 3.2 Enum Migration Table

| Legacy Enum | Legacy Value | New Value | Migration Path |
|-------------|--------------|-----------|----------------|
| `ConfidenceLevel` (archetype) | `'VERY_LOW'` | `0.15` | `migrateLegacyConfidence()` |
| `ConfidenceLevel` (archetype) | `'LOW'` | `0.30` | `migrateLegacyConfidence()` |
| `ConfidenceLevel` (archetype) | `'MEDIUM'` | `0.55` | `migrateLegacyConfidence()` |
| `ConfidenceLevel` (archetype) | `'HIGH'` | `0.80` | `migrateLegacyConfidence()` |
| `ConfidenceLevel` (archetype) | `'VERY_HIGH'` | `0.95` | `migrateLegacyConfidence()` |
| `ConfidenceLevel` (uncertainty) | `'LOW'` | `0.80` (inverse) | `1 - migrateLegacyConfidence()` |
| `ConfidenceLevel` (uncertainty) | `'MEDIUM'` | `0.55` (inverse) | `1 - migrateLegacyConfidence()` |
| `ConfidenceLevel` (uncertainty) | `'HIGH'` | `0.30` (inverse) | `1 - migrateLegacyConfidence()` |
| `ConfidenceLevel` (uncertainty) | `'VERY_HIGH'` | `0.15` (inverse) | `1 - migrateLegacyConfidence()` |
| `EvidenceConfidence` | `'very-low'` | `0.10` | `migrateLegacyConfidence()` |
| `EvidenceConfidence` | `'low'` | `0.25` | `migrateLegacyConfidence()` |
| `EvidenceConfidence` | `'moderate'` | `0.50` | `migrateLegacyConfidence()` |
| `EvidenceConfidence` | `'high'` | `0.75` | `migrateLegacyConfidence()` |
| `EvidenceConfidence` | `'very-high'` | `0.90` | `migrateLegacyConfidence()` |
| `SignalConfidence` | `'strong'` | `0.85` | `migrateLegacyConfidence()` |
| `SignalConfidence` | `'moderate'` | `0.60` | `migrateLegacyConfidence()` |
| `SignalConfidence` | `'weak'` | `0.35` | `migrateLegacyConfidence()` |
| `SignalConfidence` | `'uncertain'` | `0.20` | `migrateLegacyConfidence()` |
| Integer 0-100 | `85` | `0.85` | `value / 100` |
| Integer 0-100 | `50` | `0.50` | `value / 100` |

---

### 3.3 Type Migration Table

| Legacy Type | Legacy Definition | New Type | Migration |
|-------------|-------------------|----------|-----------|
| `ConfidenceLevel` (archetype) | String enum | `Confidence` | `migrateLegacyConfidence()` |
| `ConfidenceScore` (learning) | `number` // 0-1 | `Confidence` | Direct use |
| `ConfidenceScore` (validation) | `number` // 0-100 | `Confidence` | `value / 100` |
| `AssessmentConfidenceLevel` | `'LOW' \| 'MEDIUM' \| 'HIGH'` | `Confidence` | `migrateLegacyConfidence()` |
| `RecommendationConfidenceLevel` | String enum | `Confidence` | `migrateLegacyConfidence()` |
| `ConfidenceBand` (stability) | Custom enum | `ReliabilityBand` | Map to reliability |

---

## PART 4 — CONFIDENCE AUTHORITY DESIGN

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONFIDENCE AUTHORITY                                 │
│                    (Single Owner of Uncertainty)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     PUBLIC API LAYER                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  calculate   │  │  calibrate   │  │   explain    │              │   │
│  │  │ Confidence() │  │ Confidence() │  │ Confidence() │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   CORE ENGINE LAYER                                  │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Confidence   │  │ Uncertainty  │  │  Reliability │              │   │
│  │  │  Engine      │  │   Engine     │  │    Engine    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Calibration  │  │   Source     │  │  Aggregation │              │   │
│  │  │   Engine     │  │  Trust       │  │    Engine    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  MODULE LAYER (Domain-Specific)                      │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   Career     │  │  Decision    │  │    Fit       │              │   │
│  │  │  Confidence  │  │  Confidence  │  │  Confidence  │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  Market      │  │  Archetype   │  │ Recommendation│             │   │
│  │  │  Confidence  │  │  Confidence  │  │  Confidence  │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   Source     │  │  Evidence    │  │   Forecast   │              │   │
│  │  │  Reliability │  │   Quality    │  │  Confidence  │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   INFRASTRUCTURE LAYER                               │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  Lineage     │  │   History    │  │   Monitor    │              │   │
│  │  │   Tracker    │  │   Store      │  │    Service   │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   Audit      │  │   Cache      │  │   Circuit    │              │   │
│  │  │    Logger    │  │    Layer     │  │   Breaker    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Public Interface

```typescript
/**
 * Confidence Authority Public Interface
 * 
 * Single entry point for all confidence operations.
 */

export interface IConfidenceAuthority {
  // ========================================================================
  // CONFIDENCE CALCULATION
  // ========================================================================
  
  /**
   * Calculate confidence for any prediction.
   * 
   * @param request - Confidence calculation request
   * @returns Confidence value with full metadata
   */
  calculateConfidence(request: ConfidenceRequest): Promise<ConfidenceValue>;
  
  /**
   * Calculate confidence for multiple predictions (batch).
   * 
   * @param requests - Array of confidence requests
   * @returns Array of confidence values
   */
  calculateConfidenceBatch(
    requests: ConfidenceRequest[]
  ): Promise<ConfidenceValue[]>;
  
  /**
   * Calculate uncertainty profile.
   * 
   * @param request - Uncertainty calculation request
   * @returns Uncertainty profile
   */
  calculateUncertainty(request: UncertaintyRequest): Promise<UncertaintyProfile>;
  
  /**
   * Calculate reliability assessment.
   * 
   * @param request - Reliability assessment request
   * @returns Reliability assessment
   */
  calculateReliability(request: ReliabilityRequest): Promise<ReliabilityAssessment>;
  
  // ========================================================================
  // CALIBRATION
  // ========================================================================
  
  /**
   * Calibrate confidence based on outcomes.
   * 
   * @param observation - Calibration observation
   */
  addCalibrationObservation(observation: CalibrationObservation): Promise<void>;
  
  /**
   * Get calibration profile for a system.
   * 
   * @param systemId - System identifier
   * @returns Calibration profile
   */
  getCalibrationProfile(systemId: string): Promise<CalibrationProfile>;
  
  /**
   * Apply calibration adjustment to confidence.
   * 
   * @param confidence - Raw confidence
   * @param systemId - System that produced confidence
   * @returns Calibrated confidence
   */
  calibrateConfidence(
    confidence: Confidence,
    systemId: string
  ): Promise<ConfidenceValue>;
  
  // ========================================================================
  // EXPLANATION
  // ========================================================================
  
  /**
   * Get explanation for a confidence value.
   * 
   * Used by Mentor Authority to explain confidence to students.
   * 
   * @param lineageId - Confidence lineage ID
   * @returns Human-readable explanation
   */
  explainConfidence(lineageId: string): Promise<ConfidenceExplanation>;
  
  /**
   * Get confidence factors breakdown.
   * 
   * @param lineageId - Confidence lineage ID
   * @returns Factor breakdown
   */
  getConfidenceFactors(lineageId: string): Promise<ConfidenceFactor[]>;
  
  // ========================================================================
  // SOURCE TRUST
  // ========================================================================
  
  /**
   * Get trust score for a data source.
   * 
   * @param sourceId - Source identifier
   * @returns Source trust assessment
   */
  getSourceTrust(sourceId: string): Promise<SourceTrustAssessment>;
  
  /**
   * Update source trust based on outcomes.
   * 
   * @param sourceId - Source identifier
   * @param outcome - Outcome data
   */
  updateSourceTrust(sourceId: string, outcome: SourceOutcome): Promise<void>;
  
  // ========================================================================
  // AGGREGATION
  // ========================================================================
  
  /**
   * Aggregate multiple confidence values.
   * 
   * @param confidences - Confidence values to aggregate
   * @param method - Aggregation method
   * @returns Aggregated confidence
   */
  aggregateConfidence(
    confidences: ConfidenceValue[],
    method: AggregationMethod
  ): Promise<ConfidenceValue>;
  
  // ========================================================================
  // QUERY
  // ========================================================================
  
  /**
   * Get confidence history for a system.
   * 
   * @param systemId - System identifier
   * @param options - Query options
   * @returns Confidence history
   */
  getConfidenceHistory(
    systemId: string,
    options?: HistoryQueryOptions
  ): Promise<ConfidenceHistory>;
  
  /**
   * Check if system is calibrated.
   * 
   * @param systemId - System identifier
   * @returns True if calibrated
   */
  isCalibrated(systemId: string): Promise<boolean>;
  
  /**
   * Get system reliability trend.
   * 
   * @param systemId - System identifier
   * @returns Reliability trend
   */
  getReliabilityTrend(systemId: string): Promise<ReliabilityTrend>;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface ConfidenceRequest {
  /** Request ID for tracing */
  readonly requestId: string;
  
  /** System requesting confidence */
  readonly requestingSystem: string;
  
  /** Type of prediction */
  readonly predictionType: PredictionType;
  
  /** Prediction data */
  readonly prediction: unknown;
  
  /** Evidence supporting prediction */
  readonly evidence: Evidence[];
  
  /** Context for calculation */
  readonly context: ConfidenceContext;
  
  /** Required confidence components */
  readonly requiredComponents?: ConfidenceComponentType[];
}

export type PredictionType =
  | 'career-fit'
  | 'career-recommendation'
  | 'decision'
  | 'archetype'
  | 'market-trend'
  | 'skill-match'
  | 'outcome-prediction'
  | 'similarity'
  | 'transition';

export interface UncertaintyRequest {
  readonly requestId: string;
  readonly requestingSystem: string;
  readonly predictionType: PredictionType;
  readonly prediction: unknown;
  readonly uncertaintyTypes?: UncertaintyType[];
}

export type UncertaintyType = 'aleatoric' | 'epistemic' | 'model' | 'data';

export interface ReliabilityRequest {
  readonly requestId: string;
  readonly requestingSystem: string;
  readonly systemId: string;
  readonly lookbackPeriod?: number;
}

// ============================================================================
// AGGREGATION
// ============================================================================

export type AggregationMethod =
  | 'weighted-average'
  | 'minimum'
  | 'maximum'
  | 'bayesian'
  | 'dempster-shafer'
  | 'consensus';
```

---

### 4.3 Domain-Specific Modules

#### Module: CareerConfidenceModule

```typescript
/**
 * Career Confidence Module
 * 
 * Calculates confidence for career-related predictions.
 * Replaces: FitConfidenceEngine, CareerConfidenceEngine
 */

export interface CareerConfidenceModule {
  calculateCareerFitConfidence(
    fitResult: CareerFitResult,
    profile: StudentProfile,
    career: Career
  ): Promise<ConfidenceValue>;
  
  calculateCareerEvidenceConfidence(
    evidence: CareerEvidence
  ): Promise<ConfidenceValue>;
  
  calculateCareerSimilarityConfidence(
    similarity: CareerSimilarity
  ): Promise<ConfidenceValue>;
  
  calculateCareerTransitionConfidence(
    transition: CareerTransition
  ): Promise<ConfidenceValue>;
}
```

#### Module: DecisionConfidenceModule

```typescript
/**
 * Decision Confidence Module
 * 
 * Calculates confidence for decision-related predictions.
 * Replaces: DecisionConfidenceEngine, RecommendationConfidenceEngine
 */

export interface DecisionConfidenceModule {
  calculateDecisionConfidence(
    decision: Decision,
    profile: StudentProfile,
    options: DecisionOption[]
  ): Promise<ConfidenceValue>;
  
  calculateRecommendationConfidence(
    recommendation: Recommendation,
    profile: StudentProfile
  ): Promise<ConfidenceValue>;
  
  calculateRankingConfidence(
    ranking: Ranking
  ): Promise<ConfidenceValue>;
}
```

#### Module: MarketConfidenceModule

```typescript
/**
 * Market Confidence Module
 * 
 * Calculates confidence for market-related predictions.
 * Replaces: MarketConfidenceEngine, ConfidenceForecastEngine, DiscoveryConfidenceEngine
 */

export interface MarketConfidenceModule {
  calculateMarketTrendConfidence(
    trend: MarketTrend
  ): Promise<ConfidenceValue>;
  
  calculateForecastConfidence(
    forecast: Forecast
  ): Promise<ConfidenceValue>;
  
  calculateDiscoveryConfidence(
    discovery: Discovery
  ): Promise<ConfidenceValue>;
  
  calculateSignalConfidence(
    signal: MarketSignal
  ): Promise<ConfidenceValue>;
}
```

#### Module: ArchetypeConfidenceModule

```typescript
/**
 * Archetype Confidence Module
 * 
 * Calculates confidence for archetype predictions.
 * Replaces: ArchetypeConfidenceEngine
 */

export interface ArchetypeConfidenceModule {
  calculateArchetypeConfidence(
    profile: ArchetypeProfile,
    signals: ArchetypeSignal[]
  ): Promise<ConfidenceValue>;
  
  calculateArchetypeStability(
    profile: ArchetypeProfile
  ): Promise<StabilityAssessment>;
}
```

#### Module: SourceTrustModule

```typescript
/**
 * Source Trust Module
 * 
 * Manages trust scores for data sources.
 * Replaces: SourceTrustEngine, SourceReliabilityEngine
 */

export interface SourceTrustModule {
  getSourceTrust(sourceId: string): Promise<SourceTrust>;
  
  updateSourceTrust(
    sourceId: string,
    outcome: SourceOutcome
  ): Promise<void>;
  
  calculateSourceReliability(
    sourceId: string
  ): Promise<ReliabilityAssessment>;
  
  rankSourcesByTrust(
    sourceIds: string[]
  ): Promise<RankedSource[]>;
}
```

---

### 4.4 Internal Architecture

```typescript
/**
 * Confidence Authority Implementation
 */

export class ConfidenceAuthority implements IConfidenceAuthority {
  // Core engines
  private confidenceEngine: ConfidenceEngine;
  private uncertaintyEngine: UncertaintyEngine;
  private reliabilityEngine: ReliabilityEngine;
  private calibrationEngine: CalibrationEngine;
  private aggregationEngine: AggregationEngine;
  
  // Domain modules
  private careerModule: CareerConfidenceModule;
  private decisionModule: DecisionConfidenceModule;
  private marketModule: MarketConfidenceModule;
  private archetypeModule: ArchetypeConfidenceModule;
  private sourceTrustModule: SourceTrustModule;
  
  // Infrastructure
  private lineageTracker: LineageTracker;
  private historyStore: HistoryStore;
  private auditLogger: AuditLogger;
  private monitor: ConfidenceMonitor;
  
  constructor(config: ConfidenceAuthorityConfig) {
    // Initialize core engines
    this.confidenceEngine = new ConfidenceEngine(config.confidence);
    this.uncertaintyEngine = new UncertaintyEngine(config.uncertainty);
    this.reliabilityEngine = new ReliabilityEngine(config.reliability);
    this.calibrationEngine = new CalibrationEngine(config.calibration);
    this.aggregationEngine = new AggregationEngine();
    
    // Initialize domain modules
    this.careerModule = new CareerConfidenceModule(this.confidenceEngine);
    this.decisionModule = new DecisionConfidenceModule(this.confidenceEngine);
    this.marketModule = new MarketConfidenceModule(this.confidenceEngine);
    this.archetypeModule = new ArchetypeConfidenceModule(this.confidenceEngine);
    this.sourceTrustModule = new SourceTrustModule(this.reliabilityEngine);
    
    // Initialize infrastructure
    this.lineageTracker = new LineageTracker();
    this.historyStore = new HistoryStore(config.storage);
    this.auditLogger = new AuditLogger();
    this.monitor = new ConfidenceMonitor();
  }
  
  async calculateConfidence(request: ConfidenceRequest): Promise<ConfidenceValue> {
    // 1. Validate request
    this.validateRequest(request);
    
    // 2. Check cache
    const cached = await this.checkCache(request);
    if (cached) {
      this.auditLogger.logCacheHit(request);
      return cached;
    }
    
    // 3. Route to appropriate module
    const module = this.selectModule(request.predictionType);
    
    // 4. Calculate confidence
    const startTime = Date.now();
    const confidence = await module.calculate(request);
    const duration = Date.now() - startTime;
    
    // 5. Apply calibration
    const calibrated = await this.calibrationEngine.calibrate(
      confidence,
      request.requestingSystem
    );
    
    // 6. Create lineage
    const lineageId = this.lineageTracker.track(request, calibrated);
    
    // 7. Enrich with metadata
    const enriched: ConfidenceValue = {
      ...calibrated,
      lineageId,
      calculatedAt: Date.now(),
      authority: 'ConfidenceAuthority',
    };
    
    // 8. Store history
    await this.historyStore.store(enriched);
    
    // 9. Audit log
    this.auditLogger.logCalculation(request, enriched, duration);
    
    // 10. Monitor
    this.monitor.recordCalculation(enriched);
    
    return enriched;
  }
  
  // ... other methods
}
```

---

## PART 5 — MIGRATION PLAN

### 5.1 Migration Overview

| Phase | Duration | Systems | Risk |
|-------|----------|---------|------|
| Phase 0: Foundation | Week 1 | 0 | LOW |
| Phase 1: Critical Engines | Weeks 2-3 | 8 | HIGH |
| Phase 2: Secondary Engines | Weeks 4-5 | 12 | MEDIUM |
| Phase 3: Cleanup | Week 6 | 8 | LOW |
| Phase 4: Validation | Week 7 | 0 | LOW |
| Phase 5: Production | Week 8 | 0 | LOW |

---

### 5.2 Phase 0: Foundation (Week 1)

**Objective:** Establish Confidence Authority infrastructure

**Tasks:**
1. Create Confidence Authority directory structure
2. Implement unified confidence model (Part 3)
3. Create ConfidenceAuthority class shell
4. Set up testing infrastructure
5. Create migration utilities

**Deliverables:**
- `src/intelligence/confidence-authority/` directory
- `Confidence.ts` (unified model)
- `ConfidenceAuthority.ts` (shell)
- Migration utilities

**Risk:** LOW (no production impact)

---

### 5.3 Phase 1: Critical Engines (Weeks 2-3)

#### 5.3.1 FitConfidenceEngine → CareerConfidenceModule

**Current State:**
- Location: `src/career-fit/fit-confidence-engine.ts`
- Owner: CareerFit (Knowledge Authority)
- Lines: ~300
- Dependencies: StudentLifeProfile, CareerIntelligence

**Migration Steps:**

1. **Week 2, Day 1-2: Create Module**
   ```typescript
   // src/intelligence/confidence-authority/modules/CareerConfidenceModule.ts
   export class CareerConfidenceModule {
     calculateFitConfidence(
       fitResult: CareerFitResult,
       profile: StudentProfile,
       career: Career
     ): Promise<ConfidenceValue> {
       // Migrate logic from FitConfidenceEngine
       // Use unified confidence model
     }
   }
   ```

2. **Week 2, Day 3-4: Migrate Logic**
   - Copy `calculateConfidence()` logic
   - Convert 0-100 scores to 0.0-1.0
   - Replace enum confidence levels
   - Update type imports

3. **Week 2, Day 5: Update CareerFitEngine**
   ```typescript
   // Before:
   fitResult = this.confidenceEngine.calculateConfidence(fitResult, profile, career);
   
   // After:
   const confidence = await confidenceAuthority.calculateConfidence({
     predictionType: 'career-fit',
     prediction: fitResult,
     evidence: [...],
     context: {...}
   });
   fitResult = {...fitResult, confidence};
   ```

4. **Week 3, Day 1-2: Testing**
   - Unit tests for module
   - Integration tests with CareerFitEngine
   - Regression tests

5. **Week 3, Day 3: Deprecate Old Engine**
   ```typescript
   // Add deprecation notice
   /**
    * @deprecated Use ConfidenceAuthority.calculateConfidence() instead
    */
   export class FitConfidenceEngine { ... }
   ```

**Risk:** HIGH (core functionality)

**Rollback Strategy:**
```typescript
// Feature flag
if (useConfidenceAuthority) {
  confidence = await confidenceAuthority.calculateConfidence(...);
} else {
  confidence = this.confidenceEngine.calculateConfidence(...); // Legacy
}
```

---

#### 5.3.2 ArchetypeConfidenceEngine → ArchetypeConfidenceModule

**Current State:**
- Location: `src/archetype/archetype-confidence-engine.ts`
- Owner: Archetype (Memory Authority)
- Lines: ~500
- Uses string enum: `'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'`

**Migration Steps:**

1. **Week 2, Day 3-4: Create Module**
   ```typescript
   // src/intelligence/confidence-authority/modules/ArchetypeConfidenceModule.ts
   export class ArchetypeConfidenceModule {
     calculateArchetypeConfidence(
       profile: ArchetypeProfile,
       signals: ArchetypeSignal[]
     ): Promise<ConfidenceValue> {
       // Migrate logic
       // Use migrateLegacyConfidence() for enum conversion
     }
   }
   ```

2. **Week 2, Day 5: Migrate Logic**
   - Copy all calculation methods
   - Replace `ConfidenceLevel` enum with `Confidence` type
   - Convert 0-100 scores to 0.0-1.0
   - Use `determineConfidenceLevel()` from unified model

3. **Week 3, Day 1-2: Update ArchetypeEngine**
   ```typescript
   // Before:
   const confidence = this.confidenceEngine.calculateConfidence(profile, signals);
   
   // After:
   const confidence = await confidenceAuthority.calculateConfidence({
     predictionType: 'archetype',
     prediction: profile,
     evidence: signals.map(s => ({...})),
     context: {...}
   });
   ```

4. **Week 3, Day 3-4: Testing & Deprecation**

**Risk:** HIGH (core functionality)

---

#### 5.3.3 RecommendationConfidenceEngine → DecisionConfidenceModule

**Current State:**
- Location: `src/recommendation/recommendation-confidence-engine.ts`
- Owner: Recommendation (Decision Authority)
- Lines: ~400

**Migration Steps:**

1. **Week 2, Day 3-4: Create Module**
   ```typescript
   // src/intelligence/confidence-authority/modules/DecisionConfidenceModule.ts
   export class DecisionConfidenceModule {
     calculateRecommendationConfidence(
       recommendation: Recommendation,
       profile: StudentProfile
     ): Promise<ConfidenceValue> {
       // Migrate logic from RecommendationConfidenceEngine
     }
   }
   ```

2. **Week 2, Day 5: Migrate Logic**

3. **Week 3, Day 1-2: Update CareerRecommendationEngine**

4. **Week 3, Day 3-4: Testing & Deprecation**

**Risk:** HIGH (core functionality)

---

#### 5.3.4 DecisionConfidenceEngine → DecisionConfidenceModule

**Current State:**
- Location: `src/decision-intelligence/decision-confidence-engine.ts`
- Owner: Decision (Decision Authority)
- Lines: ~600

**Migration Steps:**

1. **Week 3, Day 1-2: Extend DecisionConfidenceModule**
   ```typescript
   export class DecisionConfidenceModule {
     // From RecommendationConfidenceEngine
     calculateRecommendationConfidence(...)
     
     // From DecisionConfidenceEngine
     calculateDecisionConfidence(...)
   }
   ```

2. **Week 3, Day 3-4: Migrate Logic**

3. **Week 3, Day 5: Update DecisionIntelligenceEngine**

**Risk:** HIGH (core functionality)

---

### 5.4 Phase 2: Secondary Engines (Weeks 4-5)

#### 5.4.1 MarketConfidenceEngine, ConfidenceForecastEngine, DiscoveryConfidenceEngine → MarketConfidenceModule

**Consolidation Strategy:**

Merge 3 market confidence engines into 1 module:

```typescript
export class MarketConfidenceModule {
  // From MarketConfidenceEngine
  calculateMarketTrendConfidence(...)
  
  // From ConfidenceForecastEngine
  calculateForecastConfidence(...)
  
  // From DiscoveryConfidenceEngine
  calculateDiscoveryConfidence(...)
}
```

**Timeline:** Week 4

**Risk:** MEDIUM

---

#### 5.4.2 UncertaintyEngine (3 variants) → UncertaintyEngine (single)

**Consolidation Strategy:**

Merge 3 uncertainty engines into 1:

| Source | Components to Merge |
|--------|-------------------|
| `active-learning/uncertainty-engine.ts` | Active learning uncertainty |
| `validation/uncertainty-engine.ts` | Validation uncertainty |
| `uncertainty-engine/UncertaintyEngineV1.ts` | Core uncertainty |

**Timeline:** Week 4

**Risk:** MEDIUM

---

#### 5.4.3 ConfidenceCalibrationEngine (4 variants) → CalibrationEngine

**Consolidation Strategy:**

Merge 4 calibration engines into 1:

| Source | Components to Merge |
|--------|-------------------|
| `calibration/confidence-calibration-engine.ts` | Core calibration |
| `validation/confidence-calibration-engine.ts` | Validation calibration |
| `outcome-learning/confidence-calibration-engine.ts` | Outcome calibration |
| `outcome-tracking/engines/confidence-calibration-engine.ts` | Tracking calibration |

**Timeline:** Week 5

**Risk:** MEDIUM

---

#### 5.4.4 ReliabilityEngine (2 variants) → ReliabilityEngine

**Consolidation Strategy:**

Merge 2 reliability engines:

| Source | Components to Merge |
|--------|-------------------|
| `calibration/reliability-engine.ts` | Core reliability |
| `assessment/validation/reliability-engine.ts` | Assessment reliability |

**Timeline:** Week 5

**Risk:** LOW

---

#### 5.4.5 SourceTrustEngine + SourceReliabilityEngine → SourceTrustModule

**Consolidation Strategy:**

Merge trust and reliability into single module:

```typescript
export class SourceTrustModule {
  // From SourceTrustEngine
  getSourceTrust(...)
  updateSourceTrust(...)
  
  // From SourceReliabilityEngine
  calculateSourceReliability(...)
}
```

**Timeline:** Week 5

**Risk:** LOW

---

### 5.5 Phase 3: Cleanup (Week 6)

#### 5.5.1 Delete Deprecated Engines

| Engine | Action | Verification |
|--------|--------|--------------|
| FitConfidenceEngine | Delete | No imports remain |
| ArchetypeConfidenceEngine | Delete | No imports remain |
| RecommendationConfidenceEngine | Delete | No imports remain |
| DecisionConfidenceEngine | Delete | No imports remain |
| MarketConfidenceEngine | Delete | No imports remain |
| ConfidenceForecastEngine | Delete | No imports remain |
| DiscoveryConfidenceEngine | Delete | No imports remain |
| ConfidenceAwareRecommendationEngineV1 | Delete | No imports remain |
| UncertaintyEngineV1 | Delete | No imports remain |

#### 5.5.2 Remove Confidence Enums

| Enum | Action |
|------|--------|
| `ConfidenceLevel` (archetype) | Delete, use `Confidence` |
| `ConfidenceLevel` (uncertainty) | Delete, use `Confidence` |
| `AssessmentConfidenceLevel` | Delete, use `Confidence` |
| `RecommendationConfidenceLevel` | Delete, use `Confidence` |
| `EvidenceConfidence` | Delete, use `Confidence` |
| `SignalConfidence` | Delete, use `Confidence` |

#### 5.5.3 Update Type Definitions

Update all type definitions to use unified `Confidence` type.

---

### 5.6 Phase 4: Validation (Week 7)

**Validation Tasks:**

1. **Compliance Audit**
   - Run constitutional compliance check
   - Verify 100% confidence ownership by Confidence Authority
   - Check for remaining violations

2. **Integration Testing**
   - End-to-end confidence calculation tests
   - Cross-authority integration tests
   - Performance benchmarks

3. **Regression Testing**
   - Compare confidence values before/after migration
   - Ensure no behavioral changes
   - Validate enum migrations

4. **Observability Validation**
   - Verify confidence lineage tracking
   - Check audit logs
   - Validate monitoring

---

### 5.7 Phase 5: Production (Week 8)

**Production Tasks:**

1. **Remove Feature Flags**
2. **Delete Legacy Code**
3. **Update Documentation**
4. **Production Monitoring**
5. **Incident Response Plan**

---

## PART 6 — DELETE DUPLICATE LOGIC

### 6.1 Delete List

#### 6.1.1 Engines to Delete (9)

| # | Engine | Reason | Replacement |
|---|--------|--------|-------------|
| 1 | FitConfidenceEngine | Migrated to CareerConfidenceModule | ConfidenceAuthority.calculateConfidence() |
| 2 | ArchetypeConfidenceEngine | Migrated to ArchetypeConfidenceModule | ConfidenceAuthority.calculateConfidence() |
| 3 | RecommendationConfidenceEngine | Migrated to DecisionConfidenceModule | ConfidenceAuthority.calculateConfidence() |
| 4 | DecisionConfidenceEngine | Migrated to DecisionConfidenceModule | ConfidenceAuthority.calculateConfidence() |
| 5 | MarketConfidenceEngine | Migrated to MarketConfidenceModule | ConfidenceAuthority.calculateConfidence() |
| 6 | ConfidenceForecastEngine | Migrated to MarketConfidenceModule | ConfidenceAuthority.calculateConfidence() |
| 7 | DiscoveryConfidenceEngine | Migrated to MarketConfidenceModule | ConfidenceAuthority.calculateConfidence() |
| 8 | UncertaintyEngineV1 | Duplicate functionality | UncertaintyEngine in ConfidenceAuthority |
| 9 | ConfidenceAwareRecommendationEngineV1 | Standalone duplicate | Use RecommendationEngine + ConfidenceAuthority |

---

### 6.2 Merge List

#### 6.2.1 Engines to Merge (6 Groups)

| Group | Engines | Merge Into |
|-------|---------|------------|
| 1 | UncertaintyEngine (ActiveLearning, Validation, V1) | Single UncertaintyEngine |
| 2 | ConfidenceCalibrationEngine (4 variants) | Single CalibrationEngine |
| 3 | ReliabilityEngine (2 variants) | Single ReliabilityEngine |
| 4 | SourceTrustEngine + SourceReliabilityEngine | SourceTrustModule |
| 5 | Calibration Engines (Recommendation, Decision, Regret, Criticality) | CalibrationEngine with modules |
| 6 | ConfidenceEngine + UncertaintyEngine (Stability) | Single interface |

---

### 6.3 Refactor List

#### 6.3.1 Systems to Refactor (86+)

All systems that previously calculated confidence must be refactored to call Confidence Authority.

Example refactor:

```typescript
// BEFORE (Violation):
export class CareerFitEngine {
  private confidenceEngine = new FitConfidenceEngine();
  
  calculateFit(...) {
    const fit = this.calculateRawFit(...);
    return this.confidenceEngine.calculateConfidence(fit, profile, career);
  }
}

// AFTER (Compliant):
export class CareerFitEngine {
  constructor(private confidenceAuthority: IConfidenceAuthority) {}
  
  async calculateFit(...) {
    const fit = this.calculateRawFit(...);
    const confidence = await this.confidenceAuthority.calculateConfidence({
      predictionType: 'career-fit',
      prediction: fit,
      evidence: [...],
      context: {...}
    });
    return {...fit, confidence};
  }
}
```

---

## PART 7 — CONFIDENCE API

### 7.1 API Design

#### 7.1.1 Public Methods

```typescript
export interface IConfidenceAuthority {
  // Core calculation
  calculateConfidence(request: ConfidenceRequest): Promise<ConfidenceValue>;
  calculateConfidenceBatch(requests: ConfidenceRequest[]): Promise<ConfidenceValue[]>;
  calculateUncertainty(request: UncertaintyRequest): Promise<UncertaintyProfile>;
  calculateReliability(request: ReliabilityRequest): Promise<ReliabilityAssessment>;
  
  // Calibration
  addCalibrationObservation(observation: CalibrationObservation): Promise<void>;
  getCalibrationProfile(systemId: string): Promise<CalibrationProfile>;
  calibrateConfidence(confidence: Confidence, systemId: string): Promise<ConfidenceValue>;
  
  // Explanation (for Mentor Authority)
  explainConfidence(lineageId: string): Promise<ConfidenceExplanation>;
  getConfidenceFactors(lineageId: string): Promise<ConfidenceFactor[]>;
  
  // Source trust
  getSourceTrust(sourceId: string): Promise<SourceTrustAssessment>;
  updateSourceTrust(sourceId: string, outcome: SourceOutcome): Promise<void>;
  
  // Aggregation
  aggregateConfidence(confidences: ConfidenceValue[], method: AggregationMethod): Promise<ConfidenceValue>;
  
  // Query
  getConfidenceHistory(systemId: string, options?: HistoryQueryOptions): Promise<ConfidenceHistory>;
  isCalibrated(systemId: string): Promise<boolean>;
  getReliabilityTrend(systemId: string): Promise<ReliabilityTrend>;
}
```

---

### 7.2 Events

```typescript
export interface ConfidenceEvents {
  // Calculation events
  'confidence.calculated': {
    lineageId: string;
    systemId: string;
    predictionType: string;
    confidence: Confidence;
    duration: number;
  };
  
  // Calibration events
  'confidence.calibrated': {
    systemId: string;
    originalConfidence: Confidence;
    calibratedConfidence: Confidence;
    adjustment: number;
  };
  
  // Drift events
  'confidence.drift.detected': {
    systemId: string;
    severity: 'mild' | 'moderate' | 'severe';
    direction: 'overconfidence' | 'underconfidence';
  };
  
  // Source trust events
  'source.trust.updated': {
    sourceId: string;
    oldTrust: number;
    newTrust: number;
    reason: string;
  };
}
```

---

### 7.3 Error Handling

```typescript
export class ConfidenceError extends Error {
  constructor(
    message: string,
    public code: string,
    public lineageId?: string
  ) {
    super(message);
    this.name = 'ConfidenceError';
  }
}

export class ConfidenceValidationError extends ConfidenceError {
  constructor(message: string) {
    super(message, 'CONFIDENCE_VALIDATION_ERROR');
  }
}

export class ConfidenceCalculationError extends ConfidenceError {
  constructor(message: string, lineageId?: string) {
    super(message, 'CONFIDENCE_CALCULATION_ERROR', lineageId);
  }
}

export class CalibrationError extends ConfidenceError {
  constructor(message: string, systemId: string) {
    super(message, 'CALIBRATION_ERROR');
  }
}
```

---

### 7.4 Contracts

#### 7.4.1 Consumer Contract

All consumers MUST:
1. Request confidence from Confidence Authority
2. Never calculate confidence independently
3. Include lineage ID in outputs
4. Report outcomes for calibration

#### 7.4.2 Provider Contract

Confidence Authority MUST:
1. Return valid ConfidenceValue for all requests
2. Track lineage for all calculations
3. Apply calibration when available
4. Provide explanation for all confidence values

---

## PART 8 — OBSERVABILITY

### 8.1 Confidence Tracing

```typescript
export interface ConfidenceLineage {
  lineageId: string;
  requestId: string;
  timestamp: number;
  
  // Request details
  requestingSystem: string;
  predictionType: string;
  
  // Calculation trace
  calculation: {
    component: string;
    method: string;
    inputs: unknown;
    factors: ConfidenceFactor[];
    evidence: ConfidenceEvidence[];
  };
  
  // Calibration trace
  calibration?: {
    originalConfidence: Confidence;
    calibratedConfidence: Confidence;
    adjustmentFactor: number;
    profileId: string;
  };
  
  // Propagation trace
  dependencies?: ConfidenceLineage[];
  
  // Output
  result: ConfidenceValue;
  duration: number;
}
```

---

### 8.2 Confidence Monitoring

```typescript
export interface ConfidenceMetrics {
  // Calculation metrics
  calculationsTotal: Counter;
  calculationsDuration: Histogram;
  calculationsErrors: Counter;
  
  // Calibration metrics
  calibrationDrift: Gauge;
  calibrationError: Gauge;
  
  // Source trust metrics
  sourceTrustScores: Gauge;
  sourceReliability: Gauge;
  
  // Confidence distribution
  confidenceDistribution: Histogram;
  
  // Cache metrics
  cacheHitRate: Gauge;
  cacheSize: Gauge;
}
```

---

### 8.3 Calibration Monitoring

```typescript
export interface CalibrationMonitor {
  // Track calibration status per system
  trackCalibration(systemId: string, profile: CalibrationProfile): void;
  
  // Detect drift
  detectDrift(systemId: string): Promise<DriftDetectionResult>;
  
  // Alert on severe drift
  alertOnDrift(systemId: string, severity: 'severe'): void;
}
```

---

### 8.4 Confidence Drift Detection

```typescript
export interface DriftDetectionResult {
  systemId: string;
  detected: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  direction: 'overconfidence' | 'underconfidence' | 'mixed';
  affectedBins: string[];
  recommendation: string;
}

export class DriftDetector {
  detect(profile: CalibrationProfile): DriftDetectionResult {
    const recentBins = profile.binCalibrations.slice(-5);
    const errors = recentBins.map(b => Math.abs(b.predictedRate - b.observedRate));
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    
    if (avgError > 0.3) {
      return {
        detected: true,
        severity: 'severe',
        direction: this.determineDirection(recentBins),
        affectedBins: recentBins.map(b => `${b.binRange[0]}-${b.binRange[1]}`),
        recommendation: 'Immediate recalibration required'
      };
    }
    
    // ... more detection logic
  }
}
```

---

### 8.5 Audit Logs

```typescript
export interface ConfidenceAuditLog {
  timestamp: number;
  eventType: 'calculation' | 'calibration' | 'drift' | 'trust-update';
  lineageId: string;
  systemId: string;
  details: unknown;
}

// Example audit log entry
{
  timestamp: 1751558400000,
  eventType: 'calculation',
  lineageId: 'conf-abc-123',
  systemId: 'CareerFitEngine',
  details: {
    predictionType: 'career-fit',
    confidence: 0.82,
    factors: [
      { name: 'profile-confidence', weight: 0.3, contribution: 0.246 },
      { name: 'career-confidence', weight: 0.3, contribution: 0.255 },
      { name: 'evidence-confidence', weight: 0.2, contribution: 0.16 },
      { name: 'calculation-confidence', weight: 0.2, contribution: 0.159 }
    ],
    duration: 12 // ms
  }
}
```

---

### 8.6 Health Dashboard

```typescript
export interface ConfidenceHealthDashboard {
  // Overall health
  overallStatus: 'healthy' | 'degraded' | 'critical';
  
  // System health
  systemHealth: Map<string, {
    status: 'healthy' | 'degraded' | 'critical';
    reliability: number;
    calibrationError: number;
    lastCalibrated: number;
  }>;
  
  // Confidence distribution
  confidenceDistribution: {
    '0.0-0.2': number;
    '0.2-0.4': number;
    '0.4-0.6': number;
    '0.6-0.8': number;
    '0.8-1.0': number;
  };
  
  // Top issues
  topIssues: Array<{
    system: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}
```

---

## PART 9 — PRODUCTION VALIDATION

### 9.1 Validation Framework

```typescript
export class ConfidenceValidationFramework {
  constructor(private confidenceAuthority: IConfidenceAuthority) {}
  
  async runValidation(): Promise<ValidationReport> {
    const checks = await Promise.all([
      this.validateSingleAuthority(),
      this.validateNoDuplicates(),
      this.validateNoEnums(),
      this.validateNoHiddenSystems(),
      this.validateCalibration(),
      this.validateObservability()
    ]);
    
    return {
      passed: checks.every(c => c.passed),
      checks,
      timestamp: Date.now()
    };
  }
  
  async validateSingleAuthority(): Promise<ValidationCheck> {
    // Check that only Confidence Authority calculates confidence
    const violations = await this.findConfidenceCalculations();
    
    return {
      name: 'Single Authority',
      passed: violations.length === 0,
      violations,
      message: violations.length === 0 
        ? 'Only Confidence Authority calculates confidence'
        : `Found ${violations.length} violations`
    };
  }
  
  async validateNoDuplicates(): Promise<ValidationCheck> {
    // Check for duplicate confidence calculations
    const duplicates = await this.findDuplicateCalculations();
    
    return {
      name: 'No Duplicates',
      passed: duplicates.length === 0,
      violations: duplicates,
      message: duplicates.length === 0
        ? 'No duplicate confidence calculations'
        : `Found ${duplicates.length} duplicates`
    };
  }
  
  async validateNoEnums(): Promise<ValidationCheck> {
    // Check for remaining confidence enums
    const enums = await this.findConfidenceEnums();
    
    return {
      name: 'No Enums',
      passed: enums.length === 0,
      violations: enums,
      message: enums.length === 0
        ? 'No legacy confidence enums remain'
        : `Found ${enums.length} legacy enums`
    };
  }
  
  async validateNoHiddenSystems(): Promise<ValidationCheck> {
    // Check for hidden confidence systems
    const hidden = await this.findHiddenSystems();
    
    return {
      name: 'No Hidden Systems',
      passed: hidden.length === 0,
      violations: hidden,
      message: hidden.length === 0
        ? 'No hidden confidence systems'
        : `Found ${hidden.length} hidden systems`
    };
  }
  
  async validateCalibration(): Promise<ValidationCheck> {
    // Check calibration status
    const uncalibrated = await this.findUncalibratedSystems();
    
    return {
      name: 'Calibration',
      passed: uncalibrated.length === 0,
      violations: uncalibrated,
      message: uncalibrated.length === 0
        ? 'All systems calibrated'
        : `${uncalibrated.length} systems need calibration`
    };
  }
  
  async validateObservability(): Promise<ValidationCheck> {
    // Check observability
    const lineageCoverage = await this.getLineageCoverage();
    
    return {
      name: 'Observability',
      passed: lineageCoverage >= 0.99,
      metrics: { lineageCoverage },
      message: lineageCoverage >= 0.99
        ? 'Full observability coverage'
        : `Lineage coverage: ${(lineageCoverage * 100).toFixed(1)}%`
    };
  }
}
```

---

### 9.2 Automated Checks

```bash
#!/bin/bash
# confidence-validation.sh

echo "Running Confidence Authority Validation..."

# Check 1: No calculateConfidence outside Confidence Authority
echo "Checking for confidence calculations outside Confidence Authority..."
VIOLATIONS=$(grep -r "calculateConfidence" src --include="*.ts" | grep -v "confidence-authority" | wc -l)
if [ $VIOLATIONS -gt 0 ]; then
  echo "FAIL: Found $VIOLATIONS violations"
  exit 1
fi

# Check 2: No confidence enums
echo "Checking for confidence enums..."
ENUMS=$(grep -r "ConfidenceLevel\|ConfidenceEnum" src --include="*.ts" | grep -v "confidence-authority" | wc -l)
if [ $ENUMS -gt 0 ]; then
  echo "FAIL: Found $ENUMS legacy enums"
  exit 1
fi

# Check 3: No 0-100 confidence scores
echo "Checking for 0-100 confidence scales..."
SCORES=$(grep -r "confidence.*0-100\|confidence.*// 0-100" src --include="*.ts" | wc -l)
if [ $SCORES -gt 0 ]; then
  echo "FAIL: Found $SCORES legacy 0-100 scales"
  exit 1
fi

echo "PASS: All validation checks passed"
```

---

### 9.3 Compliance Verification

| Check | Method | Target |
|-------|--------|--------|
| Single Authority | Code grep | Zero violations |
| No Duplicates | Static analysis | Zero duplicates |
| No Enums | TypeScript compiler | Zero enum types |
| No Hidden Systems | Dependency graph | All systems accounted |
| Calibration | Runtime check | 100% calibrated |
| Observability | Log analysis | 100% lineage coverage |

---

## PART 10 — SUCCESS CRITERIA

### 10.1 Targets

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Confidence Compliance | 12.5% | ≥90% | Constitutional audit |
| Confidence Authority Ownership | 35% | 100% | Engine ownership analysis |
| Confidence Model Unification | 5 scales | 1 scale | Type analysis |
| Duplicate Calculations | 37 | 0 | Static analysis |
| Confidence Enums | 12+ | 0 | Type analysis |
| Hidden Systems | Unknown | 0 | Dependency analysis |
| Lineage Coverage | 0% | 100% | Observability audit |

---

### 10.2 Definition of Done

**Confidence Authority is complete when:**

1. ✅ Single Confidence Authority owns all uncertainty quantification
2. ✅ All confidence calculations route through Confidence Authority
3. ✅ Unified 0.0-1.0 float confidence model in use everywhere
4. ✅ Zero confidence enums remain in codebase
5. ✅ Zero duplicate confidence calculations
6. ✅ Zero hidden confidence systems
7. ✅ Complete confidence lineage tracking
8. ✅ Confidence calibration operational
9. ✅ Confidence observability dashboard live
10. ✅ All 86+ consumer systems refactored to use Confidence Authority

---

### 10.3 Exit Criteria

| Criterion | Threshold | Verification |
|-----------|-----------|--------------|
| Constitutional Compliance | ≥90% | Run audit script |
| Test Coverage | ≥90% | Jest coverage report |
| Performance Regression | <5% | Benchmark comparison |
| Zero Critical Bugs | 0 | Bug tracker |
| Documentation Complete | 100% | Docs review |
| Rollback Plan Tested | Pass | DR drill |

---

## APPENDICES

### Appendix A: File Inventory

**Total Confidence-Related Files: 106**

**By Directory:**
- `src/intelligence/calibration/`: 10 files
- `src/intelligence/market/`: 12 files
- `src/intelligence/recommendation-stability/`: 5 files
- `src/intelligence/validation/`: 6 files
- `src/intelligence/learning-loop/`: 3 files
- `src/intelligence/active-learning/`: 4 files
- `src/intelligence/uncertainty-engine/`: 3 files
- `src/intelligence/confidence-aware-recommendation/`: 2 files
- `src/intelligence/recommendation-fusion/`: 4 files
- `src/intelligence/outcome-learning/`: 4 files
- `src/intelligence/bayesian-belief-engine/`: 2 files
- `src/intelligence/confidence-propagation-engine/`: 2 files
- `src/archetype/`: 4 files
- `src/career-fit/`: 3 files
- `src/recommendation/`: 4 files
- `src/decision-intelligence/`: 4 files
- `src/assessment/`: 6 files
- `src/outcome-tracking/`: 6 files
- `src/market-data-ingestion/`: 4 files
- Other: 19 files

---

### Appendix B: Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance regression | Medium | High | Feature flags, caching |
| Behavioral changes | Medium | High | Extensive testing |
| Circular dependencies | Low | High | Dependency injection |
| Consumer migration incomplete | Medium | High | Automated checks |
| Data migration errors | Low | Critical | Validation scripts |
| Production incidents | Low | Critical | Rollback plan |

---

### Appendix C: Production Readiness Checklist

- [ ] All 37 confidence systems migrated
- [ ] All 86+ consumers refactored
- [ ] 100% test coverage for Confidence Authority
- [ ] Performance benchmarks pass
- [ ] Load testing complete
- [ ] Security review passed
- [ ] Documentation complete
- [ ] Runbook created
- [ ] Monitoring alerts configured
- [ ] On-call trained
- [ ] Rollback plan tested
- [ ] Feature flags ready

---

### Appendix D: Migration Commands

```bash
# Step 1: Create branch
git checkout -b wave1-confidence-consolidation

# Step 2: Run migration scripts
npm run migrate:confidence

# Step 3: Run tests
npm run test:confidence

# Step 4: Run validation
npm run validate:confidence

# Step 5: Build
npm run build

# Step 6: Deploy to staging
npm run deploy:staging

# Step 7: Run smoke tests
npm run test:smoke

# Step 8: Deploy to production
npm run deploy:production

# Step 9: Monitor
npm run monitor:confidence
```

---

**END OF WAVE 1 — CONFIDENCE AUTHORITY CONSOLIDATION**

**Document Version:** 1.0  
**Date:** 2026-06-04  
**Status:** COMPLETE  
**Next Step:** Begin Phase 0 Implementation
