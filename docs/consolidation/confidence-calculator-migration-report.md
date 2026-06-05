# Confidence Calculator Migration Report

**Wave 1.2 — Legacy Confidence Eradication**

**Date:** 2026-06-04

---

## Executive Summary

**Total Legacy Calculators Identified:** 24

**Migration Priority:**
- 🔴 Critical (Blocking): 8 calculators
- 🟡 High (Affects Core): 10 calculators  
- 🟢 Medium (Can Defer): 6 calculators

**Target:** 24 → 0 calculators

---

## Calculator Inventory

### 🔴 Critical Priority (Core Systems)

| # | File | Class/Function | Owner Authority | Migration Strategy |
|---|------|---------------|-----------------|-------------------|
| 1 | `src/career-fit/fit-confidence-engine.ts` | `FitConfidenceEngine` | Career Fit | Migrate to CareerConfidenceModule |
| 2 | `src/archetype/archetype-confidence-engine.ts` | `ArchetypeConfidenceEngine` | Archetype | Migrate to ArchetypeConfidenceModule |
| 3 | `src/decision-intelligence/decision-confidence-engine.ts` | `DecisionConfidenceEngine` | Decision Intelligence | Migrate to DecisionConfidenceModule |
| 4 | `src/recommendation/recommendation-confidence-engine.ts` | `RecommendationConfidenceEngine` | Recommendation | Migrate to DecisionConfidenceModule |
| 5 | `src/assessment/confidence-calculator.ts` | `ConfidenceCalculator` | Assessment | Migrate to ConfidenceAuthority |
| 6 | `src/archetype/confidence-calculator.ts` | `ConfidenceCalculator` | Archetype | Delete (duplicate) |
| 7 | `src/intelligence/recommendation-stability/confidence-engine.ts` | `ConfidenceEngine` | Recommendation Stability | Migrate to ConfidenceAuthority |
| 8 | `src/intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts` | `BeliefConfidenceEngine` | Bayesian Belief | Migrate to ConfidenceAuthority |

### 🟡 High Priority (Intelligence Layer)

| # | File | Class/Function | Owner Authority | Migration Strategy |
|---|------|---------------|-----------------|-------------------|
| 9 | `src/intelligence/market/MarketConfidenceEngine.ts` | `MarketConfidenceEngine` | Market Intelligence | Migrate to MarketConfidenceModule |
| 10 | `src/intelligence/market/forecasting/ConfidenceForecastEngine.ts` | `ConfidenceForecastEngine` | Market Forecasting | Migrate to MarketConfidenceModule |
| 11 | `src/intelligence/market/discovery/DiscoveryConfidenceEngine.ts` | `DiscoveryConfidenceEngine` | Market Discovery | Migrate to MarketConfidenceModule |
| 12 | `src/intelligence/calibration/confidence-calibration-engine.ts` | `ConfidenceCalibrationEngine` | Calibration | Merge into ConfidenceAuthority.Calibration |
| 13 | `src/intelligence/validation/confidence-calibration-engine.ts` | `ConfidenceCalibrationEngine` | Validation | Merge into ConfidenceAuthority.Calibration |
| 14 | `src/outcome-tracking/engines/confidence-calibration-engine.ts` | `ConfidenceCalibrationEngineImpl` | Outcome Tracking | Merge into ConfidenceAuthority.Calibration |
| 15 | `src/intelligence/learning-loop/confidence-adjustment-engine.ts` | `ConfidenceAdjustmentEngine` | Learning Loop | Migrate to ConfidenceAuthority |
| 16 | `src/intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts` | `ConfidenceAwareRecommendationEngineV1` | Recommendation | Migrate to ConfidenceAuthority |
| 17 | `src/intelligence/confidence-propagation-engine/ConfidencePropagationEngineV1.ts` | `ConfidencePropagationEngineV1` | Confidence Propagation | Migrate to ConfidenceAuthority.Aggregator |
| 18 | `src/intelligence/recommendation-fusion/confidence-fusion-engine.ts` | `ConfidenceFusionEngine` | Recommendation Fusion | Migrate to ConfidenceAuthority.Aggregator |

### 🟢 Medium Priority (Utility/Support)

| # | File | Class/Function | Owner Authority | Migration Strategy |
|---|------|---------------|-----------------|-------------------|
| 19 | `src/intelligence/market/forecasting/models/ForecastConfidence.ts` | `calculateConfidence()` | Market | Inline into caller |
| 20 | `src/intelligence/outcome-evidence-engine/analysis.ts` | `calculateConfidenceInterval()` | Outcome Evidence | Keep (statistical function) |
| 21 | `src/intelligence/outcome-evidence-engine/analysis.ts` | `calculateConfidenceFromStats()` | Outcome Evidence | Keep (statistical function) |
| 22 | `src/intelligence/similar-student-engine/calculators.ts` | `calculateConfidence()` | Similar Student | Migrate to ConfidenceAuthority |
| 23 | `src/intelligence/market/integration/models/MarketAwareCareerAnalysis.ts` | `calculateConfidenceAdjustment()` | Market Integration | Inline into caller |
| 24 | `src/intelligence/active-learning/uncertainty-engine.ts` | `calculateConfidenceIntervalUncertainty()` | Active Learning | Rename to avoid confusion |

---

## Migration Actions

### Action: DELETE (Duplicate/Obsolete)

- `src/archetype/confidence-calculator.ts` - Duplicate of archetype-confidence-engine

### Action: MERGE INTO AUTHORITY

- `src/intelligence/calibration/confidence-calibration-engine.ts`
- `src/intelligence/validation/confidence-calibration-engine.ts`
- `src/outcome-tracking/engines/confidence-calibration-engine.ts`

### Action: MIGRATE TO MODULE

- `src/career-fit/fit-confidence-engine.ts` → CareerConfidenceModule
- `src/archetype/archetype-confidence-engine.ts` → ArchetypeConfidenceModule
- `src/decision-intelligence/decision-confidence-engine.ts` → DecisionConfidenceModule
- `src/recommendation/recommendation-confidence-engine.ts` → DecisionConfidenceModule
- `src/intelligence/market/MarketConfidenceEngine.ts` → MarketConfidenceModule
- `src/intelligence/market/forecasting/ConfidenceForecastEngine.ts` → MarketConfidenceModule
- `src/intelligence/market/discovery/DiscoveryConfidenceEngine.ts` → MarketConfidenceModule

### Action: MIGRATE TO AUTHORITY

- `src/assessment/confidence-calculator.ts`
- `src/intelligence/recommendation-stability/confidence-engine.ts`
- `src/intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts`
- `src/intelligence/learning-loop/confidence-adjustment-engine.ts`
- `src/intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts`
- `src/intelligence/confidence-propagation-engine/ConfidencePropagationEngineV1.ts`
- `src/intelligence/recommendation-fusion/confidence-fusion-engine.ts`
- `src/intelligence/similar-student-engine/calculators.ts`

---

## Post-Migration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 CONFIDENCE AUTHORITY                         │
│              (Single Source of Truth)                        │
├─────────────────────────────────────────────────────────────┤
│  Core Components:                                            │
│  ├─ ConfidenceCalculator      (calculation logic)            │
│  ├─ ConfidenceAggregator      (aggregation logic)            │
│  ├─ ConfidenceCalibration     (calibration logic)            │
│  ├─ ConfidenceHistory         (history tracking)             │
│  └─ ConfidenceMonitoring      (drift detection)              │
├─────────────────────────────────────────────────────────────┤
│  Domain Modules (deprecated, delegate to Authority):         │
│  ├─ CareerConfidenceModule                                   │
│  ├─ ArchetypeConfidenceModule                                │
│  ├─ DecisionConfidenceModule                                 │
│  └─ MarketConfidenceModule                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

- [ ] All 24 legacy calculators migrated or deleted
- [ ] Zero confidence calculators outside Authority
- [ ] All tests passing
- [ ] 90%+ compliance score achieved

---

*Report generated by Constitutional Consolidation Program*
