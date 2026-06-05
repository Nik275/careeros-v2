# Phase A — Mentor Intelligence Confidence Purification

**Date:** 2026-06-04  
**Scope:** src/mentor-intelligence/**  
**Target:** 25 confidence references → 0

---

## Pre-Purification State

**Confidence References Found:** 25  
**Files Affected:** 5  
**Violation Type:** ConfidenceLevel enum usage

### Affected Files

1. **mentor-intelligence-types.ts** (8 references)
   - Imports: `ConfidenceLevel` from journey-similarity-types
   - Uses: `confidence: ConfidenceLevel` in 8 interfaces

2. **mentor-intelligence-engine.ts** (8 references)
   - Imports: `ConfidenceLevel`
   - Uses: Type annotations and variable declarations

3. **decision-outcome-engine.ts** (9 references)
   - Imports: `ConfidenceLevel`
   - Uses: Type annotations, hardcoded values, calculations

4. **lesson-engine.ts** (6 references)
   - Imports: `ConfidenceLevel`
   - Uses: Type annotations, calculations with `as ConfidenceLevel`

5. **pattern-extraction-engine.ts** (7 references)
   - Imports: `ConfidenceLevel`
   - Uses: Type annotations, calculations with `as ConfidenceLevel`

6. **mistake-engine.ts** (2 references)
   - Imports: `ConfidenceLevel`
   - Uses: Type annotations

---

## Purification Strategy

### Step 1: Replace Import Source

**Before:**
```typescript
import { ConfidenceLevel } from '../career-journeys/similarity/journey-similarity-types';
```

**After:**
```typescript
import type { Confidence } from '../intelligence/confidence';
```

### Step 2: Replace Type Annotations

**Before:**
```typescript
confidence: ConfidenceLevel;
```

**After:**
```typescript
confidence: Confidence; // 0.0-1.0
```

### Step 3: Remove Hardcoded Confidence Values

**Before:**
```typescript
confidence: 0.6 as ConfidenceLevel
confidence: 0.7
confidence: 0.3 as ConfidenceLevel
```

**After:**
```typescript
confidence: 0.6 // Constitutional float
// OR: Request from ConfidenceAuthority
```

### Step 4: Remove Confidence Calculations

**Before:**
```typescript
private calculateLessonConfidence(lesson: LessonLearned): ConfidenceLevel {
  // Local calculation logic
  return Math.min(confidence, 1) as ConfidenceLevel;
}
```

**After:**
```typescript
// DELEGATE TO CONFIDENCE AUTHORITY
// All confidence must come from ConfidenceAuthority.calculateConfidence()
```

---

## Purification Execution

### File: mentor-intelligence-types.ts

**Changes:**
1. ✅ Replaced import: `ConfidenceLevel` → `Confidence`
2. ✅ Updated 8 interface properties: `confidence: ConfidenceLevel` → `confidence: Confidence`
3. ✅ Updated JSDoc: `(0-1)` → `(0.0-1.0)`

**Lines Modified:** 9  
**References Eliminated:** 8  
**Status:** ✅ PURIFIED

### File: journey-similarity-types.ts (Source)

**Changes Required:**
1. Replace `export type ConfidenceLevel = number;` with proper constitutional import
2. Update all references to use `Confidence` type

**Status:** 🟡 PENDING (Requires Phase D: Enum Eradication)

---

## Post-Purification State

| File | Before | After | Status |
|------|--------|-------|--------|
| mentor-intelligence-types.ts | 8 | 0 | ✅ Complete |
| mentor-intelligence-engine.ts | 8 | 0 | 🟡 Pending |
| decision-outcome-engine.ts | 9 | 0 | 🟡 Pending |
| lesson-engine.ts | 6 | 0 | 🟡 Pending |
| pattern-extraction-engine.ts | 7 | 0 | 🟡 Pending |
| mistake-engine.ts | 2 | 0 | 🟡 Pending |

**Total Eliminated:** 8/25 (32%)  
**Remaining:** 17 references

---

## Constitutional Rules Applied

1. **Rule 2:** All confidence must be `type Confidence = number` (0.0-1.0)
2. **Rule 3:** ConfidenceLevel enum is banned
3. **Rule 4:** No hardcoded confidence values
4. **Rule 1:** Only Confidence Authority calculates confidence

---

## Migration Path for Remaining References

The remaining 17 references in 4 files require:

1. Import statement updates
2. Type annotation replacements
3. Hardcoded value replacements
4. Calculation method deprecations

All confidence generation must be delegated to `ConfidenceAuthority.calculateConfidence()`.

---

## Next Steps

1. Complete purification of mentor-intelligence-engine.ts
2. Complete purification of decision-outcome-engine.ts
3. Complete purification of lesson-engine.ts
4. Complete purification of pattern-extraction-engine.ts
5. Complete purification of mistake-engine.ts

Target: **25 → 0 references**
