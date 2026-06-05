# CareerOS Critical Threshold Fixes

**Status:** REQUIRED BEFORE PRODUCTION  
**Priority:** P0 - Blocking  
**Estimated Fix Time:** 30 minutes  
**Re-test Required:** Yes

---

## The Problem

Stress test results show catastrophic oscillation:
- **86.6%** of students experience tier flipping
- **7.38** average tier changes per student (target: <2)
- **349/500** students have >5 changes in 12 months

---

## Required Changes

### File: `lib/intelligence/reliability/threshold-calibration.ts`

#### 1. WISE_MENTOR_PROFILE - Increase All Thresholds

```typescript
// BEFORE:
export const WISE_MENTOR_PROFILE: CalibrationProfile = {
  name: 'wise_mentor',
  description: 'Balanced profile for general use',
  hysteresis: {
    minScoreChangeForTierChange: 10,
    minSessionsForDirectionalConfirmation: 4,
    minTrendStrengthForChange: 0.65,
    cooldownPeriodMs: 48 * 60 * 60 * 1000, // 48 hours
    maxVolatilityThreshold: 0.35,
    demotionScoreThreshold: 12,
    demotionMinSessions: 3,
    minConfidenceForTierChange: 0.70,
    minConfidenceForPromotion: 0.75,
    minConfidenceForDemotion: 0.70,
  },
  // ...
}

// AFTER:
export const WISE_MENTOR_PROFILE: CalibrationProfile = {
  name: 'wise_mentor',
  description: 'Balanced profile for general use',
  hysteresis: {
    minScoreChangeForTierChange: 15,      // ↑ 50% increase
    minSessionsForDirectionalConfirmation: 6,  // ↑ 50% increase
    minTrendStrengthForChange: 0.75,      // ↑ 15% increase
    cooldownPeriodMs: 14 * 24 * 60 * 60 * 1000, // 14 days (was 2 days)
    maxVolatilityThreshold: 0.30,         // ↓ More strict
    demotionScoreThreshold: 18,           // ↑ 50% increase
    demotionMinSessions: 5,               // ↑ 67% increase
    minConfidenceForTierChange: 0.80,     // ↑ 14% increase
    minConfidenceForPromotion: 0.85,      // ↑ 13% increase
    minConfidenceForDemotion: 0.80,       // ↑ 14% increase
  },
  // ...
}
```

#### 2. CONSERVATIVE_PROFILE - Even More Strict

```typescript
// BEFORE:
export const CONSERVATIVE_PROFILE: CalibrationProfile = {
  name: 'conservative',
  hysteresis: {
    minScoreChangeForTierChange: 15,
    minSessionsForDirectionalConfirmation: 5,
    minTrendStrengthForChange: 0.75,
    cooldownPeriodMs: 72 * 60 * 60 * 1000, // 72 hours
    // ...
  },
  // ...
}

// AFTER:
export const CONSERVATIVE_PROFILE: CalibrationProfile = {
  name: 'conservative',
  hysteresis: {
    minScoreChangeForTierChange: 20,      // ↑ 33% increase
    minSessionsForDirectionalConfirmation: 8,  // ↑ 60% increase
    minTrendStrengthForChange: 0.80,      // ↑ 7% increase
    cooldownPeriodMs: 30 * 24 * 60 * 60 * 1000, // 30 days (was 3 days)
    // ...
  },
  // ...
}
```

#### 3. Enhance Emotional Dampening

```typescript
// BEFORE:
stabilityRules: {
  anxietySpikeThreshold: 0.75,
  anxietyAdjustmentFactor: 6,
  stressSpikeThreshold: 0.80,
  stressAdjustmentFactor: 5,
  confidenceCrashThreshold: 0.25,
  confidenceAdjustmentFactor: 8,
}

// AFTER:
stabilityRules: {
  anxietySpikeThreshold: 0.70,          // ↓ Lower threshold (earlier intervention)
  anxietyAdjustmentFactor: 12,          // ↑ 100% increase (doubled)
  stressSpikeThreshold: 0.75,           // ↓ Lower threshold
  stressAdjustmentFactor: 10,           // ↑ 100% increase (doubled)
  confidenceCrashThreshold: 0.30,       // ↑ Higher threshold (catch more cases)
  confidenceAdjustmentFactor: 15,       // ↑ 88% increase (nearly doubled)
}
```

#### 4. Strengthen Oscillation Detection

```typescript
// BEFORE:
stabilityRules: {
  oscillationDetectionWindow: 4,
  oscillationTierChangeThreshold: 2,
}

// AFTER:
stabilityRules: {
  oscillationDetectionWindow: 6,        // ↑ 50% increase (longer lookback)
  oscillationTierChangeThreshold: 1,    // ↓ Block after 1 change (was 2)
  // NEW: Add cooldown multiplier when oscillation detected
  oscillationCooldownMultiplier: 3,     // 3x normal cooldown
}
```

---

### File: `lib/intelligence/reliability/tier-hysteresis.ts`

#### 5. Add Burnout Detection

```typescript
// Add to evaluateTierChange function:

function isInBurnoutMode(history: RecommendationHistory): boolean {
  const recentSessions = history.entries.slice(-10);
  const burnoutIndicators = recentSessions.filter(entry => {
    // Detect burnout patterns:
    // - Multiple consecutive low scores
    // - High anxiety/stress markers
    // - Sudden drop from high to low
    return entry.score < 45 && entry.confidence < 0.5;
  });
  
  return burnoutIndicators.length >= 5; // 5 of last 10 sessions
}

// In evaluateTierChange, add check:
if (isInBurnoutMode(history)) {
  return {
    allowed: false,
    reason: 'burnout_mode_active',
    explanation: 'Student appears to be in burnout/recovery. Changes suppressed for stability.',
    // ...
  };
}
```

#### 6. Add Predictive Oscillation Blocking

```typescript
// BEFORE: Block after oscillation detected
// AFTER: Block before second change if first was recent

function wouldCreateOscillation(
  history: RecommendationHistory,
  proposedTier: CareerTier,
  cooldownPeriodMs: number
): boolean {
  const recentChanges = history.entries
    .filter((e, i) => i > 0 && e.tier !== history.entries[i-1].tier)
    .slice(-2); // Last 2 changes
  
  if (recentChanges.length === 0) return false;
  
  const lastChange = recentChanges[recentChanges.length - 1];
  const timeSinceLastChange = Date.now() - lastChange.timestamp.getTime();
  
  // If changed within last 30 days, check if this would be a reversal
  if (timeSinceLastChange < 30 * 24 * 60 * 60 * 1000) {
    const previousTier = recentChanges.length > 1 ? recentChanges[0].tier : null;
    if (previousTier && proposedTier === previousTier) {
      return true; // This would be A-B-A oscillation
    }
  }
  
  return false;
}
```

---

### File: `lib/intelligence/reliability/score-stability.ts`

#### 7. Enhance Emotional Adjustment

```typescript
// BEFORE:
export function applyEmotionalAdjustment(
  score: number,
  emotionalFactors: EmotionalState,
  history: HistoryEntry[]
): number {
  // ... current implementation
  let adjustedScore = score;
  
  if (anxietyOutlier.isOutlier) {
    adjustedScore += hysteresis.anxietyAdjustmentFactor || 6;
  }
  // ...
}

// AFTER:
export function applyEmotionalAdjustment(
  score: number,
  emotionalFactors: EmotionalState,
  history: HistoryEntry[],
  config: StabilityRuleConfig
): number {
  let adjustedScore = score;
  let adjustment = 0;
  
  // Severe anxiety - major adjustment
  if (emotionalFactors.anxiety > config.anxietySpikeThreshold) {
    const severity = (emotionalFactors.anxiety - config.anxietySpikeThreshold) / 
                     (1 - config.anxietySpikeThreshold);
    adjustment += config.anxietyAdjustmentFactor * (1 + severity);
  }
  
  // Severe stress - major adjustment
  if (emotionalFactors.stress > config.stressSpikeThreshold) {
    const severity = (emotionalFactors.stress - config.stressSpikeThreshold) / 
                     (1 - config.stressSpikeThreshold);
    adjustment += config.stressAdjustmentFactor * (1 + severity);
  }
  
  // Confidence crash - major adjustment
  if (emotionalFactors.confidence < config.confidenceCrashThreshold) {
    const severity = (config.confidenceCrashThreshold - emotionalFactors.confidence) / 
                     config.confidenceCrashThreshold;
    adjustment += config.confidenceAdjustmentFactor * (1 + severity);
  }
  
  // Cap total adjustment
  adjustment = Math.min(adjustment, 25); // Max 25 point adjustment
  
  return Math.min(100, score + adjustment);
}
```

---

## Testing the Fixes

After applying changes, re-run stress test:

```bash
npx tsx scripts/run-stress-test.ts
```

### Success Criteria

| Metric | Before | Target |
|--------|--------|--------|
| Production Score | 59.5% | >80% |
| Oscillation Rate | 86.6% | <10% |
| Changes/Student | 7.38 | <3 |
| Students with >5 changes | 349 | <50 |

---

## Rollback Plan

If changes cause underreaction issues:

```typescript
// Quick rollback to previous thresholds
const ROLLBACK_PROFILE = {
  ...WISE_MENTOR_PROFILE,
  hysteresis: {
    ...WISE_MENTOR_PROFILE.hysteresis,
    cooldownPeriodMs: 7 * 24 * 60 * 60 * 1000, // Keep 7 days (compromise)
    minSessionsForDirectionalConfirmation: 5,   // Keep 5 (compromise)
  }
};
```

---

## Files to Modify

1. `lib/intelligence/reliability/threshold-calibration.ts` - Update profiles
2. `lib/intelligence/reliability/tier-hysteresis.ts` - Add burnout/oscillation logic
3. `lib/intelligence/reliability/score-stability.ts` - Enhance emotional adjustment
4. `lib/intelligence/reliability/types.ts` - Add new config fields

---

## Estimated Impact

- **Oscillation Rate:** 86.6% → ~15% (expected)
- **Changes/Student:** 7.38 → ~2.5 (expected)
- **False Negative Rate:** 0.1% → ~2% (acceptable tradeoff)
- **Response Time:** 2-3 sessions → 4-6 sessions (acceptable)

---

## Deployment Checklist

- [ ] Apply threshold changes
- [ ] Add burnout detection
- [ ] Add predictive oscillation blocking
- [ ] Run stress test
- [ ] Verify all metrics meet targets
- [ ] Run existing unit tests
- [ ] Deploy to staging
- [ ] Monitor for 48 hours
- [ ] Deploy to production with feature flag
