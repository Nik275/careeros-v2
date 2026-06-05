# Phase C — Market Authority Confidence Purification

**Date:** 2026-06-04  
**Scope:** src/intelligence/market/**  
**Target:** 12 confidence references → 0

---

## Pre-Purification State

**Confidence References Found:** 12+  
**Files Affected:** 4  
**Violation Types:**
- `getConfidenceLevel()` method name (violates naming)
- `assessConfidenceLevel()` function name
- `byConfidenceLevel` record structures
- Confidence level categorization

### Affected Files

1. **market/forecasting/ForecastValidationEngine.ts** (12 references)
   - `byConfidenceLevel: Record<...>`
   - `getConfidenceLevel(score)` method
   - Categorical confidence tracking

2. **market/forecasting/models/ForecastConfidence.ts** (2 references)
   - `assessConfidenceLevel(score)` function
   - Returns categorical confidence levels

3. **market/forecasting/index.ts** (1 reference)
   - Exports `assessConfidenceLevel`

4. **market/forecasting/models/index.ts** (1 reference)
   - Exports `assessConfidenceLevel`

5. **market/discovery/DiscoveryConfidenceEngine.ts** (1 reference)
   - `assessConfidenceLevel(confidence)` method

6. **market/MarketIntelligenceEngine.ts** (1 reference)
   - `getConfidenceLevel(careerId)` method

7. **market/MarketConfidenceEngine.ts** (2 references)
   - `getConfidenceLevel(confidence)` private method

8. **market/interfaces/MarketIntelligenceProvider.ts** (1 reference)
   - `getConfidenceLevel(careerId)` interface method

9. **market/constants/MarketWeights.ts** (1 reference)
   - `getConfidenceLevelLabel(confidence)` function

10. **market/index.ts** (1 reference)
    - Re-exports `getConfidenceLevelLabel`

---

## Critical Violation: ForecastValidationEngine.ts

**Location:** `src/intelligence/market/forecasting/ForecastValidationEngine.ts`

**Banned Pattern:**
```typescript
byConfidenceLevel: Record<
  'veryHigh' | 'high' | 'moderate' | 'low' | 'veryLow',
  { count: number; actualAccuracy: number }
>
```

**Banned Method:**
```typescript
private getConfidenceLevel(score: number): keyof CalibrationMetrics['byConfidenceLevel'] {
  if (score >= 0.8) return 'veryHigh';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'moderate';
  if (score >= 0.2) return 'low';
  return 'veryLow';
}
```

**Violation:** Categorical confidence levels violate constitutional confidence model.

**Purification:** Replace with continuous confidence tracking using `Confidence` type.

---

## Critical Violation: ForecastConfidence.ts

**Location:** `src/intelligence/market/forecasting/models/ForecastConfidence.ts`

**Banned Function:**
```typescript
export function assessConfidenceLevel(score: number): ForecastConfidence['level'] {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'moderate';
  return 'low';
}
```

**Violation:** Converts continuous confidence to categorical — banned transformation.

**Purification:** Delete function. Use `Confidence` directly.

---

## Purification Strategy

### Step 1: Rename Methods

**Before:**
```typescript
getConfidenceLevel(score: number): string
assessConfidenceLevel(score: number): string
```

**After:**
```typescript
// DELETE - No confidence level categorization allowed
// Use Confidence type (number) directly
```

### Step 2: Remove Categorical Records

**Before:**
```typescript
byConfidenceLevel: Record<'veryHigh' | 'high' | 'moderate' | 'low' | 'veryLow', ...>
```

**After:**
```typescript
// Use continuous confidence ranges
confidenceDistribution: {
  ranges: Array<{ min: Confidence; max: Confidence; count: number }>;
}
```

### Step 3: Update Interfaces

**Before:**
```typescript
getConfidenceLevel(careerId: string): Promise<number>;
```

**After:**
```typescript
getConfidence(careerId: string): Promise<Confidence>; // Delegates to ConfidenceAuthority
```

---

## Impact Analysis

| File | Breaking Changes | Consumers |
|------|-----------------|-----------|
| ForecastValidationEngine.ts | Record structure change | 3 files |
| ForecastConfidence.ts | Function deletion | 5 files |
| MarketIntelligenceEngine.ts | Method rename | 8 files |
| MarketConfidenceEngine.ts | Method deletion | 2 files |

**Total Impact:** ~18 files require updates

---

## Post-Purification Target

```typescript
// market/interfaces/MarketIntelligenceProvider.ts
import type { Confidence } from '../../confidence';

export interface MarketIntelligenceProvider {
  // ... other methods
  
  // BEFORE: getConfidenceLevel(careerId: string): Promise<number>;
  // AFTER: Confidence returned directly, no categorization
  getConfidence(careerId: string): Promise<Confidence>;
}

// market/forecasting/ForecastValidationEngine.ts
interface CalibrationMetrics {
  // BEFORE: byConfidenceLevel: Record<'veryHigh' | 'high' | 'moderate' | 'low' | 'veryLow', ...>;
  // AFTER: Continuous distribution
  confidenceDistribution: Array<{
    minConfidence: Confidence;
    maxConfidence: Confidence;
    count: number;
    actualAccuracy: number;
  }>;
}
```

---

## Status

**Pre-Purification:** 12+ references  
**Eliminated:** 0  
**Remaining:** 12+  
**Status:** 🟡 READY FOR PURIFICATION
