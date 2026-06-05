# Phase B — Ontology Confidence Purification

**Date:** 2026-06-04  
**Scope:** src/ontology/**  
**Target:** 16 confidence references → 0

---

## Pre-Purification State

**Confidence References Found:** 16+  
**Files Affected:** 8  
**Violation Types:** 
- ConfidenceLevel enum definitions
- ConfidenceLevel type imports
- isValidConfidenceLevel() validation function
- Confidence scoring with hardcoded values

### Affected Files

1. **ontology/outcome-ontology/types.ts** (1 reference)
   - Defines: `export type ConfidenceLevel = ...`

2. **ontology/outcome-ontology/validators.ts** (6 references)
   - Function: `isValidConfidenceLevel()`
   - Usage in validation logic

3. **ontology/outcome-ontology/OutcomeScoringFramework.ts** (4 references)
   - Confidence calculation methods
   - ConfidenceLevel scoring

4. **ontology/outcome-ontology/OutcomeMetric.ts** (3 references)
   - Interface properties

5. **ontology/outcome-ontology/OutcomeDimension.ts** (3 references)
   - Interface properties

6. **ontology/outcome-ontology/builders.ts** (3 references)
   - Builder methods withConfidence()

7. **ontology/outcome-ontology/index.ts** (2 references)
   - Exports

8. **ontology/career-evidence/CareerEvidenceSystem.ts** (7 references)
   - ConfidenceLevel enum with kebab-case
   - CONFIDENCE_LEVEL_VALUES mapping
   - Validation functions

9. **ontology/index.ts** (1 reference)
   - Re-exports

---

## Critical Violation: CareerEvidenceSystem.ts

**Location:** `src/ontology/career-evidence/CareerEvidenceSystem.ts`

**Banned Enum:**
```typescript
export type ConfidenceLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
```

**Hardcoded Mappings:**
```typescript
export const CONFIDENCE_LEVEL_VALUES: Record<ConfidenceLevel, number> = {
  'very-low': 0.1,
  'low': 0.3,
  'moderate': 0.5,
  'high': 0.75,
  'very-high': 0.9,
};
```

**Violation:** This is exactly what the constitution bans — categorical confidence levels with arbitrary mappings.

**Purification:** Replace all with `type Confidence = number` from constitutional authority.

---

## Critical Violation: OutcomeScoringFramework.ts

**Location:** `src/ontology/outcome-ontology/OutcomeScoringFramework.ts`

**Banned Pattern:**
```typescript
private calculateConfidence(dimensionScores: number[], measurements: Measurement[]): ConfidenceLevel {
  // Local confidence calculation
  const confidenceScores: Record<ConfidenceLevel, number> = {
    HIGH: 0.9,
    MODERATE: 0.6,
    LOW: 0.3,
  };
  // Returns categorical confidence
}
```

**Violation:** Local confidence calculation with hardcoded category mappings.

**Purification:** Delete method. All confidence must come from ConfidenceAuthority.

---

## Purification Strategy

### Step 1: Remove ConfidenceLevel Type Definition

**Delete from:**
- `ontology/outcome-ontology/types.ts`
- `ontology/career-evidence/CareerEvidenceSystem.ts`

### Step 2: Replace with Constitutional Type

**Add to all files:**
```typescript
import type { Confidence } from '../../intelligence/confidence';
```

### Step 3: Update Interface Properties

**Before:**
```typescript
readonly confidence: ConfidenceLevel;
```

**After:**
```typescript
readonly confidence: Confidence; // 0.0-1.0 from ConfidenceAuthority
```

### Step 4: Delete Validation Functions

**Delete:**
- `isValidConfidenceLevel()` in validators.ts
- Confidence level checking logic
- All categorical confidence validation

### Step 5: Delete Calculation Methods

**Delete:**
- `calculateConfidence()` in OutcomeScoringFramework.ts
- All local confidence generation

---

## Impact Analysis

| File | Breaking Changes | Consumers |
|------|-----------------|-----------|
| outcome-ontology/types.ts | 1 type removed | 12+ files |
| outcome-ontology/validators.ts | 1 function removed | 8+ files |
| career-evidence/CareerEvidenceSystem.ts | 3 exports removed | 15+ files |
| outcome-ontology/OutcomeScoringFramework.ts | 1 method removed | 4+ files |

**Total Impact:** ~40 files require updates

---

## Migration Path

1. **Phase 1:** Remove type definitions and exports
2. **Phase 2:** Update all importing files to use `Confidence`
3. **Phase 3:** Delete validation and calculation functions
4. **Phase 4:** Add deprecation warnings during transition

---

## Post-Purification Target

```typescript
// ontology/outcome-ontology/types.ts
import type { Confidence } from '../../intelligence/confidence';

export interface OutcomeMetric {
  // ... other properties
  readonly confidence: Confidence; // 0.0-1.0 from ConfidenceAuthority
}

// No ConfidenceLevel type definition
// No isValidConfidenceLevel function
// No local confidence calculations
```

---

## Constitutional Compliance

**Rule 2:** ✅ All confidence represented as `type Confidence = number`
**Rule 3:** ✅ No ConfidenceLevel enum
**Rule 4:** ✅ No hardcoded confidence mappings
**Rule 1:** ✅ No local confidence calculation

---

## Status

**Pre-Purification:** 16+ references  
**Eliminated:** 0  
**Remaining:** 16+  
**Status:** 🟡 READY FOR PURIFICATION
