# CareerOS Comprehensive Stress Test Report

**Date:** 2026-05-27  
**Students Simulated:** 500  
**Duration:** 12 months  
**Total Sessions:** ~18,000

---

## Executive Summary

**PRODUCTION RELIABILITY SCORE: 59.5%**  
**STATUS: ❌ NOT READY FOR PRODUCTION**

The CareerOS recommendation reliability system failed comprehensive stress testing. Critical oscillation and instability patterns emerged that would severely damage student trust in real-world deployment.

---

## Key Findings

### 1. Catastrophic Oscillation Problem

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Oscillation Rate | **86.6%** | <5% | 🔴 CRITICAL |
| Oscillation Events | 2,080 | <100 | 🔴 CRITICAL |
| Affected Students | 433/500 | <25 | 🔴 CRITICAL |

**Impact:** Nearly every student experiences A-B-A-B tier flipping, destroying trust in the system.

### 2. Excessive Tier Changes

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Changes | 3,692 | <500 | 🔴 CRITICAL |
| Changes/Student | 7.38 | <2 | 🔴 CRITICAL |
| Students with >5 changes | 349 | <50 | 🔴 CRITICAL |

**Impact:** Students see their recommendations change every 1.6 months on average.

### 3. False Changes (Surprisingly Low)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| False Upgrades | 1 | <10 | 🟢 GOOD |
| False Downgrades | 4 | <10 | 🟢 GOOD |
| False Upgrade Rate | 0.0% | <2% | 🟢 GOOD |
| False Downgrade Rate | 0.1% | <2% | 🟢 GOOD |

**Finding:** The system rarely makes objectively "wrong" changes - the problem is making *too many* changes.

### 4. Stability Rate

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Tier Stability Rate | 81.3% | >95% | 🟡 MARGINAL |

**Note:** While 81% seems acceptable, this includes many sessions where the student *should* have seen changes but didn't, masking the real problem.

---

## Failure Patterns Detected

### 🔴 Critical: Rapid Tier Oscillation
- **Frequency:** 368 students (73.6%)
- **Affected Archetypes:** All archetypes affected
- **Pattern:** A-B-A-B tier flipping within 12 months
- **Root Cause:** Cooldown periods and confirmation thresholds too short

### 🟠 High: Emotion-Triggered Collapse
- **Frequency:** 234 students (46.8%)
- **Affected Archetypes:** volatile, high_anxiety, perfectionist, burnout_recovery, high_ambition
- **Pattern:** Temporary emotional states cause permanent-looking tier drops
- **Root Cause:** Emotional dampening insufficient for severe spikes

### 🟠 High: Burnout Amplification
- **Frequency:** 51 students (10.2%)
- **Affected Archetypes:** perfectionist, burnout_recovery
- **Pattern:** System piles tier changes on already-burned-out students
- **Root Cause:** No special handling for burnout state

### 🟡 Medium: Contradiction Chaos
- **Frequency:** 98 students (19.6%)
- **Affected Archetypes:** externally_pressured, multi_potentialite, confused
- **Pattern:** Confused students receive inconsistent recommendations
- **Root Cause:** Insufficient contradiction detection and resolution

---

## Performance by Archetype

| Archetype | Changes | Oscillations | Risk Level |
|-----------|---------|--------------|------------|
| stable | 257 | 151 | 🔴 HIGH |
| volatile | 414 | 234 | 🔴 CRITICAL |
| high_anxiety | 439 | 245 | 🔴 CRITICAL |
| late_bloomer | 312 | 196 | 🔴 HIGH |
| perfectionist | 361 | 180 | 🔴 HIGH |
| burnout_recovery | 362 | 199 | 🔴 HIGH |
| multi_potentialite | 348 | 191 | 🔴 HIGH |
| externally_pressured | 388 | 235 | 🔴 CRITICAL |
| high_ambition | 371 | 202 | 🔴 HIGH |
| confused | 440 | 247 | 🔴 CRITICAL |

**All archetypes exceed acceptable thresholds.** Even "stable" students experience excessive changes.

---

## Root Cause Analysis

### Primary Issues

1. **Insufficient Cooldown Periods**
   - Current: 48 hours
   - Needed: 7-14 days minimum
   - Problem: Allows emotional day-trading behavior

2. **Low Confirmation Thresholds**
   - Current: 3-4 sessions for confirmation
   - Needed: 5-7 sessions
   - Problem: Single bad week can trigger demotion

3. **Weak Oscillation Detection**
   - Current: Detects after 2 changes in 4 sessions
   - Problem: Already too late by then
   - Needed: Predictive detection before second change

4. **Inadequate Emotional Dampening**
   - Current: +5 to +8 point adjustments
   - Problem: Burnout can cause 20+ point drops
   - Needed: Context-aware dampening based on event type

### Secondary Issues

5. **No Burnout Mode**
   - System treats burnout like regular volatility
   - Should enter "recovery observation" mode

6. **Contradiction Resolution Too Slow**
   - Takes too long to stabilize confused students
   - Should reduce confidence more aggressively

---

## Critical Weaknesses Summary

1. ⚠️ **High oscillation rate: 86.6%** - Destroys student trust
2. ⚠️ **349 students with >5 tier changes** - Excessive volatility
3. ⚠️ **Critical failure patterns detected** - Systematic reliability issues

---

## Scalability Concerns

- **Session Volume:** 18,000+ sessions processed
- **Processing Time:** Acceptable for current scale
- **Memory Usage:** No significant concerns
- **Risk:** Oscillation problem scales linearly with user base

---

## Deployment Recommendation

### ❌ NOT READY FOR PRODUCTION

**Blocking Issues:**
- 86.6% oscillation rate is unacceptable
- 7.38 changes per student destroys trust
- 349/500 students have >5 changes in 12 months

**Must Fix Before Deployment:**
1. Increase cooldown to minimum 7 days (ideally 14)
2. Require 5-7 sessions for any tier change confirmation
3. Implement predictive oscillation blocking
4. Add "burnout mode" with extended observation periods
5. Strengthen emotional dampening (2x current values)

---

## Recommended Fixes

### Immediate (Blocking Deployment)

```typescript
// Current → Recommended

// Cooldown Period
hysteresis.cooldownPeriodMs: 48 * 60 * 60 * 1000  // 48 hours
→ 14 * 24 * 60 * 60 * 1000  // 14 days

// Session Confirmation
hysteresis.minSessionsForDirectionalConfirmation: 3-4
→ 6

// Promotion Confidence
hysteresis.minConfidenceForPromotion: 0.75
→ 0.85

// Demotion Confidence  
hysteresis.minConfidenceForDemotion: 0.70
→ 0.80
```

### Short Term (Post-Deployment)

1. **Predictive Oscillation Blocking**
   - Block second change if first was within 30 days
   - Require human review for rapid reversals

2. **Burnout Mode**
   - Detect burnout events
   - Enter 30-day observation mode
   - Suppress all demotions during recovery

3. **Enhanced Emotional Dampening**
   - Anxiety > 0.8: +15 point adjustment
   - Burnout detected: +20 point adjustment
   - Recovery phase: Gradual reduction

4. **Contradiction Fast-Track**
   - Reduce confidence to < 0.5 immediately on contradiction
   - Require 8+ sessions to resolve (vs current 4-5)

---

## Success Criteria for Re-Test

Before production deployment, the system must achieve:

| Metric | Current | Target |
|--------|---------|--------|
| Production Score | 59.5% | >80% |
| Oscillation Rate | 86.6% | <10% |
| Changes/Student | 7.38 | <3 |
| Students with >5 changes | 349 | <50 |
| Tier Stability Rate | 81.3% | >95% |
| False Downgrade Rate | 0.1% | <1% |

---

## Files Created/Modified

- `lib/intelligence/reliability/comprehensive-stress-test.ts` - Stress test engine
- `scripts/run-stress-test.ts` - Test runner script
- `STRESS_TEST_REPORT.md` - This report

---

## How to Reproduce

```bash
npx tsx scripts/run-stress-test.ts
```

---

## Conclusion

The CareerOS recommendation system has a **fundamental stability problem**. While accuracy is good (low false changes), the system changes recommendations far too frequently, causing massive oscillation that would destroy student trust.

**The system cannot be deployed in its current state.**

Required fixes are straightforward threshold adjustments, but these must be implemented and re-tested before production use.
