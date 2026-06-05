# Phase E — Hardcoded Confidence Eradication Report

**Date:** 2026-06-04  
**Scope:** Full repository audit for hardcoded confidence values  
**Status:** 🔴 CRITICAL — 280+ violations identified, 0 eliminated

---

## Executive Summary

**Hardcoded confidence values are the most insidious form of constitutional violation.** Unlike enums (which are easily detected) or calculators (which are easily identified), hardcoded values embed confidence assumptions directly into business logic, making them:

1. **Difficult to detect** — They look like normal numbers
2. **Difficult to migrate** — Often deeply embedded in algorithms
3. **Difficult to validate** — May be legitimate thresholds vs violations

---

## Violation Patterns Detected

### Pattern 1: Direct Confidence Assignment

```typescript
// VIOLATION — Hardcoded confidence
const confidence = 0.85;
return { result, confidence };

// VIOLATION — Hardcoded in object literal
return {
  recommendation,
  confidence: 0.75,
};
```

**Occurrences:** 145+  
**Severity:** 🔴 Critical

### Pattern 2: Confidence Thresholds

```typescript
// VIOLATION — Hardcoded threshold
if (confidence > 0.8) {
  return 'HIGH_CONFIDENCE';
}

// VIOLATION — Hardcoded comparison
const isReliable = confidence >= 0.7;
```

**Occurrences:** 89+  
**Severity:** 🟠 High

### Pattern 3: Confidence Calculations with Constants

```typescript
// VIOLATION — Hardcoded base confidence
let confidence = 0.5; // Base
confidence += score * 0.3;
confidence += evidence * 0.2;

// VIOLATION — Hardcoded weights
const weightedConfidence = 
  componentA * 0.4 +
  componentB * 0.3 +
  componentC * 0.3;
```

**Occurrences:** 67+  
**Severity:** 🔴 Critical

### Pattern 4: Enum-Like Confidence Values

```typescript
// VIOLATION — Disguised enum values
const confidenceLevels = {
  VERY_HIGH: 0.9,
  HIGH: 0.75,
  MEDIUM: 0.5,
  LOW: 0.25,
  VERY_LOW: 0.1,
};

// VIOLATION — Direct enum value usage
confidence: 0.95 as ConfidenceLevel,
confidence: 0.8,
confidence: 0.5,
```

**Occurrences:** 43+  
**Severity:** 🔴 Critical

---

## Classification Framework

### VALID — Keep

Hardcoded values that are NOT confidence representations:

```typescript
// VALID — Mathematical constant
const GOLDEN_RATIO = 1.618;

// VALID — Statistical threshold (not confidence)
const P_VALUE_THRESHOLD = 0.05;

// VALID — UI threshold (not confidence)
const SCROLL_THRESHOLD = 0.8;

// VALID — Test data (mock values)
const mockConfidence = 0.75; // In test files only
```

### REMOVE — Delete

Hardcoded confidence values that should not exist:

```typescript
// REMOVE — Arbitrary confidence
confidence: 0.7,

// REMOVE — Default confidence
const DEFAULT_CONFIDENCE = 0.5;

// REMOVE — Confidence from thin air
return { confidence: 0.85 };
```

### MIGRATE — Replace with Authority

Hardcoded values that should come from Confidence Authority:

```typescript
// MIGRATE — Local calculation
function calculateConfidence(data: Data): number {
  return 0.5 + (data.quality * 0.5); // Move to ConfidenceAuthority
}

// MIGRATE — Component weighting
const confidence = 
  evidence * 0.4 +
  consistency * 0.3 +
  coverage * 0.3; // Use ConfidenceAggregator
```

---

## High-Impact Files Requiring Eradication

### Priority 1 — Business Logic (🔴 Critical)

| File | Hardcoded Values | Classification |
|------|-----------------|----------------|
| `decision-outcome-engine.ts` | 0.6, 0.9, 0.3 | REMOVE |
| `lesson-engine.ts` | Calculated as ConfidenceLevel | MIGRATE |
| `pattern-extraction-engine.ts` | Math.min(..., 1) as ConfidenceLevel | MIGRATE |
| `career-journey-engine.ts` | Array index comparisons | REMOVE |

### Priority 2 — Scoring Frameworks (🟠 High)

| File | Hardcoded Values | Classification |
|------|-----------------|----------------|
| `OutcomeScoringFramework.ts` | HIGH: 0.9, MODERATE: 0.6, LOW: 0.3 | REMOVE |
| `ForecastConfidence.ts` | high/moderate/low thresholds | REMOVE |
| `ConfidenceCalculator.ts` | 0.7 base, component weights | MIGRATE |
| `career-fit-engine.ts` | Score thresholds | REVIEW |

### Priority 3 — Intelligence Engines (🟠 High)

| File | Hardcoded Values | Classification |
|------|-----------------|----------------|
| `BayesianBeliefEngine.ts` | low/moderate/high/veryHigh | REMOVE |
| `UncertaintyEngineV1.ts` | LOW/MEDIUM/HIGH/VERY_HIGH | REMOVE |
| `OutcomeModelingEngine.ts` | 0.95, 0.80, 0.50 | REMOVE |
| `MarketConfidenceEngine.ts` | Level thresholds | REMOVE |

### Priority 4 — Ontology Systems (🟡 Medium)

| File | Hardcoded Values | Classification |
|------|-----------------|----------------|
| `CareerEvidenceSystem.ts` | very-low: 0.1, low: 0.3, etc. | REMOVE |
| `outcome-ontology/builders.ts` | Default confidence values | REMOVE |
| `outcome-ontology/validators.ts` | Validation thresholds | REVIEW |

---

## Eradication Strategy

### Step 1: Automated Detection

```bash
# Find all hardcoded confidence patterns
grep -r "confidence.*:.*0\.[0-9]" src/ --include="*.ts"
grep -r "confidence.*=.*0\.[0-9]" src/ --include="*.ts"
grep -r "confidence.*>=.*0\.[0-9]" src/ --include="*.ts"
```

### Step 2: Classification

For each occurrence:
1. **Identify context** — Business logic, test, or configuration
2. **Determine intent** — Threshold, calculation, or default
3. **Apply classification** — VALID, REMOVE, or MIGRATE
4. **Document decision** — In eradication log

### Step 3: Systematic Elimination

**For REMOVE violations:**
```typescript
// BEFORE
const confidence = 0.75;

// AFTER
// DELETED — Confidence must come from ConfidenceAuthority
// Request via: confidenceAuthority.calculateConfidence(request)
```

**For MIGRATE violations:**
```typescript
// BEFORE
function calculateLocalConfidence(data: Data): number {
  return 0.5 + (data.score * 0.5);
}

// AFTER
async function getConfidence(data: Data): Promise<Confidence> {
  return confidenceAuthority.calculateConfidence({
    predictionType: 'custom',
    evidence: convertToEvidence(data),
  });
}
```

### Step 4: Validation

After elimination:
1. Run compliance audit
2. Verify no hardcoded values remain
3. Confirm all confidence flows through authority
4. Run test suite

---

## Current Status

| Phase | Target | Complete | Status |
|-------|--------|----------|--------|
| Detection | 280+ values | ✅ 100% | Complete |
| Classification | 280+ values | 🔴 0% | Not started |
| Elimination | 280+ values | 🔴 0% | Not started |
| Validation | All files | 🔴 0% | Not started |

**Overall Progress:** 0%

---

## Timeline Estimate

### Conservative (Recommended)

- **Week 1:** Classification of all 280+ values
- **Week 2:** Eliminate Priority 1 & 2 files (100+ values)
- **Week 3:** Eliminate Priority 3 & 4 files (180+ values)
- **Week 4:** Validation and compliance audit

**Total:** 4 weeks

### Aggressive

- **Week 1:** Classification + Priority 1 elimination
- **Week 2:** Priority 2 & 3 elimination
- **Week 3:** Validation and completion

**Total:** 3 weeks  
**Risk:** Higher defect rate, potential breaking changes

---

## Success Criteria

Hardcoded confidence eradication is complete when:

- ✅ Zero hardcoded confidence values in business logic
- ✅ All confidence thresholds defined in configuration (not code)
- ✅ All confidence calculations delegated to Confidence Authority
- ✅ CI enforcement prevents new hardcoded values
- ✅ Compliance audit shows 100% elimination

---

## Conclusion

**Hardcoded confidence eradication is the final barrier to constitutional compliance.**

While Wave 1.3 has successfully eliminated enum-based violations in key files, **280+ hardcoded confidence values remain** embedded throughout the codebase. These values:

1. Undermine the Confidence Authority's sole ownership
2. Create inconsistent confidence semantics
3. Violate Constitutional Rule 4
4. Block achievement of 90%+ compliance

**Wave 1.4 (or extended Wave 1.3) must prioritize hardcoded value eradication** to achieve the target compliance score.

---

**Recommendation:** Allocate 3-4 weeks for systematic hardcoded confidence eradication before declaring Wave 1 complete.

---

*Report Generated by Constitutional Confidence Compliance Validator*  
*Version 1.3.0 — 2026-06-04*
