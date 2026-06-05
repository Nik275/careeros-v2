# Wave 2.2 — Decision Comparison Audit

**Date:** 2026-06-04  
**Program:** CareerOS Constitutional Consolidation  
**Wave:** 2.2 — Decision Comparison Consolidation  
**Target:** DecisionComparisonEngine  
**Status:** COMPLETE  

---

## Executive Summary

This audit documents the complete structure of DecisionComparisonEngine in preparation for migration to the constitutional Decision Authority.

**Key Finding:** DecisionComparisonEngine contains **17 comparison methods** that must be transferred to DecisionAuthority.

---

## 1. File Information

| Property | Value |
|----------|-------|
| **File** | `src/decision-intelligence/decision-comparison-engine.ts` |
| **Class** | `DecisionComparisonEngine` |
| **Version** | 1.0.0 |
| **Lines** | ~500 (estimated) |
| **Methods** | 17 |
| **Public Methods** | 4 |
| **Private Methods** | 13 |

---

## 2. Public Methods (4)

### 2.1 compareDecisions()

```typescript
compareDecisions(
  comparisonId: string,
  options: DecisionOption[],
  analyses: Record<string, DecisionAnalysis>,
  criteria?: ComparisonCriteria
): DecisionComparison
```

**Purpose:** Main entry point for comparing multiple decision options.

**Inputs:**
- `comparisonId`: Unique identifier
- `options`: Array of DecisionOption
- `analyses`: Map of optionId → DecisionAnalysis
- `criteria`: Optional ComparisonCriteria

**Outputs:**
- `DecisionComparison`: Complete comparison result

**Logic Flow:**
1. Validate analyses exist for all options
2. Build dimension comparisons (compareDimensions)
3. Generate rankings (generateRankings)
4. Generate head-to-head comparisons (generateHeadToHeadComparisons)
5. Determine winner (determineWinner)
6. Identify key differentiators (identifyKeyDifferentiators)

**Migration Strategy:**
- Delegate to `DecisionAuthority.decide()` with custom config
- Convert `DecisionOption[]` to authority format
- Return authority output converted to `DecisionComparison`

---

### 2.2 compareCareerOptions()

**Purpose:** Career-specific option comparison.

**Migration Strategy:** Wrapper method that calls `compareDecisions()`.

---

### 2.3 compareDecisionPaths()

**Purpose:** Path-specific comparison for decision trees.

**Migration Strategy:** Wrapper method that calls `compareDecisions()`.

---

### 2.4 getDefaultCriteria()

```typescript
private getDefaultCriteria(): ComparisonCriteria
```

**Purpose:** Returns default comparison criteria.

**Output:**
- All 9 dimensions enabled
- Equal weights (11.11% each)

**Migration Strategy:**
- Move to DecisionAuthority default config
- Reference via authority.getConfig()

---

## 3. Private Methods (13)

### 3.1 Comparison Methods (6)

#### compareDimensions()
```typescript
private compareDimensions(
  options: DecisionOption[],
  analyses: Record<string, DecisionAnalysis>,
  criteria: ComparisonCriteria
): DimensionComparison[]
```

**Purpose:** Compare options across all dimensions.

**Logic:** Iterates through criteria.dimensions, calls compareSingleDimension for each.

**Migration:** Delegate to DecisionComparator with dimension-based config.

---

#### compareSingleDimension()
```typescript
private compareSingleDimension(
  dimension: DecisionDimension,
  options: DecisionOption[],
  analyses: Record<string, DecisionAnalysis>
): DimensionComparison
```

**Purpose:** Compare options on a single dimension.

**Logic:**
1. Extract scores for each option
2. Find best option
3. Calculate variance
4. Calculate significance

**Migration:** Use DecisionComparator with dimension extraction.

---

#### extractDimensionScore()
```typescript
private extractDimensionScore(
  dimension: DecisionDimension,
  analysis: DecisionAnalysis
): ScoredDimension
```

**Purpose:** Extract dimension score from analysis.

**Dimensions Supported:**
1. `FIT_QUALITY` → quality.fitQuality
2. `LIFESTYLE_QUALITY` → quality.lifestyleQuality
3. `VALUE_ALIGNMENT` → quality.valueAlignment
4. `FUTURE_POTENTIAL` → quality.futurePotential
5. `FLEXIBILITY` → quality.flexibility
6. `CONFIDENCE` → { score: confidence.overall, confidence: 80 }
7. `RISK_LEVEL` → calculateRiskScore()
8. `OPPORTUNITY_LEVEL` → calculateOpportunityScore()
9. `OVERALL_QUALITY` → { score: quality.overall, confidence: confidence.overall }

**Migration:** Create dimension extraction utility in DecisionComparator.

---

#### calculateRiskScore()
```typescript
private calculateRiskScore(analysis: DecisionAnalysis): ScoredDimension
```

**Purpose:** Calculate risk score (lower risk = higher score).

**Logic:**
- If no risks: return 100
- Average risk scores
- Convert to 0-100 where higher is better
- Confidence = analysis.confidence.overall

**Formula:** `score = max(100 - avgRiskScore, 0)`

**Migration:** Move to DecisionComparator as utility method.

---

#### calculateOpportunityScore()
```typescript
private calculateOpportunityScore(analysis: DecisionAnalysis): ScoredDimension
```

**Purpose:** Calculate opportunity score.

**Logic:**
- If no opportunities: return 50
- Average opportunity scores
- Confidence = analysis.confidence.overall

**Migration:** Move to DecisionComparator as utility method.

---

#### calculateDimensionSignificance()
```typescript
private calculateDimensionSignificance(
  dimension: DecisionDimension,
  variance: number
): number
```

**Purpose:** Calculate how much a dimension matters.

**Migration:** Move to DecisionComparator significance calculation.

---

### 3.2 Ranking Methods (3)

#### generateRankings()
```typescript
private generateRankings(
  options: DecisionOption[],
  analyses: Record<string, DecisionAnalysis>,
  dimensions: DimensionComparison[]
): DecisionRanking[]
```

**Purpose:** Generate overall and dimension-specific rankings.

**Migration:** Delegate to DecisionRanker with multi-criteria algorithm.

---

#### calculateOverallScore()
```typescript
private calculateOverallScore(
  optionId: string,
  dimensions: DimensionComparison[]
): number
```

**Purpose:** Calculate weighted overall score.

**Migration:** DecisionRanker score aggregation.

---

#### calculateConfidence()
```typescript
private calculateConfidence(
  optionId: string,
  dimensions: DimensionComparison[]
): number
```

**Purpose:** Calculate overall confidence for option.

**Migration:** DecisionRanker confidence aggregation.

---

### 3.3 Head-to-Head Methods (2)

#### generateHeadToHeadComparisons()
```typescript
private generateHeadToHeadComparisons(
  options: DecisionOption[],
  analyses: Record<string, DecisionAnalysis>,
  dimensions: DimensionComparison[]
): HeadToHeadComparison[]
```

**Purpose:** Generate pairwise comparisons.

**Migration:** Delegate to DecisionComparator.compareTournament().

---

#### generateHeadToHead()
```typescript
private generateHeadToHead(
  optionA: DecisionOption,
  optionB: DecisionOption,
  analyses: Record<string, DecisionAnalysis>,
  dimensions: DimensionComparison[]
): HeadToHeadComparison
```

**Purpose:** Compare two specific options.

**Migration:** Delegate to DecisionComparator.compare().

---

### 3.4 Utility Methods (2)

#### findBestOption()
```typescript
private findBestOption(
  scores: Record<string, ScoredDimension>
): string
```

**Purpose:** Find option with highest score.

**Migration:** DecisionComparator utility.

---

#### calculateVariance()
```typescript
private calculateVariance(
  scores: Record<string, ScoredDimension>
): number
```

**Purpose:** Calculate score variance across options.

**Logic:** Standard statistical variance normalized to 0-100.

**Migration:** DecisionComparator statistical utility.

---

## 4. Comparison Dimensions (9)

| Dimension | Source | Weight | Description |
|-----------|--------|--------|-------------|
| FIT_QUALITY | analysis.quality.fitQuality | 11.11% | How well option fits student |
| LIFESTYLE_QUALITY | analysis.quality.lifestyleQuality | 11.11% | Lifestyle compatibility |
| VALUE_ALIGNMENT | analysis.quality.valueAlignment | 11.11% | Values alignment |
| FUTURE_POTENTIAL | analysis.quality.futurePotential | 11.11% | Future growth |
| FLEXIBILITY | analysis.quality.flexibility | 11.11% | Flexibility score |
| CONFIDENCE | analysis.confidence.overall | 11.11% | Confidence in analysis |
| RISK_LEVEL | Calculated | 11.11% | Risk assessment |
| OPPORTUNITY_LEVEL | Calculated | 11.11% | Opportunity score |
| OVERALL_QUALITY | analysis.quality.overall | 11.11% | Overall quality |

---

## 5. Consumers

### Direct Consumers (estimated)

1. **DecisionCoalitionEngine** — Uses for stakeholder comparisons
2. **MetaDecisionEngine** — Uses for meta-decision comparison
3. **DecisionTreeEngine** — Uses for path comparison
4. **CareerPathwaySystem** — Uses for pathway comparison
5. **Various UI components** — Display comparison results

### Import Chains

```
DecisionComparisonEngine
  → DecisionCoalitionEngine
  → MetaDecisionEngine
  → DecisionTreeEngine
  → UI Components
```

---

## 6. Dependencies

### Input Types

```typescript
DecisionOption           // From decision-types
DecisionAnalysis         // From decision-types
DecisionComparison       // From decision-types
DimensionComparison      // From decision-types
DecisionRanking          // From decision-types
HeadToHeadComparison     // From decision-types
DecisionDimension        // From decision-types
ScoredDimension          // From decision-types
DecisionIntelligenceConfig  // From decision-types
ComparisonCriteria       // From decision-types
DecisionContext          // From decision-types
```

### Internal Dependencies

- No external engine dependencies
- Self-contained comparison logic
- Pure calculation engine

---

## 7. Migration Plan

### Phase 1: Audit (COMPLETE)
✅ Document all methods
✅ Map data flows
✅ Identify consumers
✅ Catalog dependencies

### Phase 2: Transfer Ownership

**Step 1:** Extend DecisionComparator
- Add dimension extraction logic
- Add risk/opportunity score calculation
- Add variance calculation

**Step 2:** Extend DecisionRanker
- Add multi-criteria ranking with dimensions
- Add overall score calculation
- Add confidence aggregation

**Step 3:** Extend DecisionExplainer
- Add dimension comparison explanation
- Add head-to-head explanation

### Phase 3: Create Delegation Layer

**DecisionComparisonEngine becomes:**
```typescript
export class DecisionComparisonEngine {
  private authority = createDecisionAuthority();
  
  @deprecated('Use DecisionAuthority.decide() directly')
  compareDecisions(comparisonId, options, analyses, criteria) {
    // Convert to authority input
    const input = this.convertToInput(options, analyses, criteria);
    
    // Delegate to authority
    const output = await this.authority.decide(input);
    
    // Convert back to legacy format
    return this.convertToLegacyOutput(output, comparisonId);
  }
}
```

### Phase 4: Testing

**Behavioral Parity Tests:**
1. Same inputs → same outputs
2. Same rankings → same order
3. Same winner → same selection
4. Same confidence → same values

**Coverage:**
- All 9 dimensions
- All comparison scenarios
- Edge cases (empty, single option, ties)

### Phase 5: Deployment

1. Code review
2. Integration testing
3. Gradual rollout
4. Monitoring

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Output differences | Low | High | Extensive parity testing |
| Consumer breakage | Low | Medium | Preserve interface |
| Performance regression | Low | Low | Benchmark testing |
| Dimension extraction errors | Medium | High | Unit test each dimension |

---

## 9. Success Criteria

**Migration Successful When:**

1. ✅ DecisionAuthority owns all comparison logic
2. ✅ DecisionComparisonEngine delegates only
3. ✅ All tests pass (100% behavioral parity)
4. ✅ No consumer code changes required
5. ✅ CI enforcement active
6. ✅ Performance within 10% of baseline

---

## 10. Constitutional Impact

**Before:**
- DecisionComparisonEngine owns comparison
- 17 methods performing comparison
- Distributed comparison logic

**After:**
- DecisionAuthority owns comparison
- DecisionComparisonEngine delegates
- Centralized comparison logic
- Single source of truth

**Compliance Improvement:**
- Wave 2.1: 8.2% decision compliance
- Wave 2.2 Target: +15% (first engine migrated)

---

**END OF AUDIT**

**Status:** Ready for migration  
**Next:** Phase 2 — Transfer Ownership  
**Confidence:** HIGH  
