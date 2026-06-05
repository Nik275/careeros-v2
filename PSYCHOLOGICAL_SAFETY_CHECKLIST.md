# CareerOS Psychological Safety Implementation Checklist

**Status:** Required before production deployment  
**Priority:** P0 - Blocking  

---

## Critical Fixes (Must Complete)

### □ Fix 1: Eliminate Oscillation (Risk: Psychological Whiplash)

**Problem:** 86.6% of students experience tier flipping  
**Target:** <10% oscillation rate  

```typescript
// File: lib/intelligence/reliability/threshold-calibration.ts

// WISE_MENTOR_PROFILE.hysteresis
{
  cooldownPeriodMs: 14 * 24 * 60 * 60 * 1000,  // ← Change: 48 hours → 14 days
  minSessionsForDirectionalConfirmation: 6,      // ← Change: 4 → 6
  minConfidenceForDemotion: 0.80,                // ← Change: 0.70 → 0.80
  minConfidenceForPromotion: 0.85,               // ← Change: 0.75 → 0.85
}

// CONSERVATIVE_PROFILE.hysteresis
{
  cooldownPeriodMs: 30 * 24 * 60 * 60 * 1000,    // ← Change: 72 hours → 30 days
  minSessionsForDirectionalConfirmation: 8,      // ← Change: 5 → 8
}
```

**Verification:**
```bash
npx tsx scripts/run-stress-test.ts
# Check: oscillationRate < 10%
```

---

### □ Fix 2: Implement Burnout Protection Mode (Risk: Burnout Amplification)

**Problem:** System makes tier changes on burned-out students  
**Solution:** Crisis observation mode  

```typescript
// File: lib/intelligence/reliability/stability-rules.ts

// Add new function
function shouldEnterCrisisMode(
  emotionalState: EmotionalState,
  history: HistoryEntry[]
): boolean {
  // Detect burnout pattern
  const recentScores = history.slice(-5).map(h => h.score);
  const averageRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  
  const burnoutIndicators = [
    emotionalState.stress > 0.85,
    emotionalState.motivation < 0.25,
    averageRecent < 40,  // Sustained low scores
    emotionalState.anxiety > 0.80 && emotionalState.confidence < 0.30,
  ];
  
  return burnoutIndicators.filter(Boolean).length >= 2;
}

// Modify isPsychologicallySafe
export function isPsychologicallySafe(
  recommendation: CareerRecommendation,
  history: RecommendationHistory,
  emotionalState: EmotionalState
): { safe: boolean; reason?: string; mode?: 'normal' | 'crisis_observation' } {
  
  // Check for crisis mode
  if (shouldEnterCrisisMode(emotionalState, history.entries)) {
    return {
      safe: false,
      reason: 'Crisis observation mode active - focusing on recovery, not career changes',
      mode: 'crisis_observation',
    };
  }
  
  // ... existing checks
}
```

**Add Crisis Messaging:**
```typescript
// File: lib/intelligence/reliability/explanation-engine.ts

function generateCrisisModeExplanation(): string {
  return [
    "I notice you're going through a challenging period.",
    "",
    "Rather than making career changes right now, let's focus on:",
    "• Understanding what you're experiencing",
    "• Identifying what you need to feel better",
    "• Exploring when you're ready, not under pressure",
    "",
    "Career clarity often follows personal stability. There's no rush."
  ].join('\n');
}
```

---

### □ Fix 3: Gentle Downgrade Messaging (Risk: Identity Threat)

**Problem:** Downgrades feel like judgment  
**Solution:** Soft landing explanations  

```typescript
// File: lib/intelligence/reliability/explanation-engine.ts

function generateTierChangeExplanation(
  careerName: string,
  fromTier: CareerTier,
  toTier: CareerTier,
  isUpgrade: boolean,
  confidence: number
): string {
  
  if (isUpgrade) {
    // Celebratory but measured
    return [
      `Your exploration of ${careerName} continues to show positive alignment.`,
      `Based on ${confidence > 0.8 ? 'strong' : 'emerging'} patterns in your responses,`,
      `this path remains worth pursuing.`,
      "",
      "Remember: This is exploration, not destiny. Keep learning."
    ].join(' ');
  } else {
    // Gentle, exploratory reframing
    return [
      `Your journey with ${careerName} is evolving - as all explorations do.`,
      "",
      "Recent sessions suggest you might want to:",
      "• Explore related paths that use similar strengths",
      "• Develop additional skills that interest you",
      "• Continue this exploration when circumstances change",
      "",
      "This is normal exploration, not a dead end. Many successful people",
      "pivot multiple times before finding their fit."
    ].join('\n');
  }
}
```

---

### □ Fix 4: Reframe Contradictions as Complexity (Risk: Self-Doubt)

**Problem:** "Claims X but Y" language implies inconsistency is bad  
**Solution:** Normalize human complexity  

```typescript
// File: lib/intelligence/reliability/contradiction-engine.ts

// BEFORE:
{
  id: 'risk_averse_entrepreneurship',
  statementA: 'I am risk-averse',
  statementB: 'I want to start my own business',
  description: 'Claims risk aversion but interested in entrepreneurship',  // ← Problematic
  severity: 'critical',  // ← Pathologizing
}

// AFTER:
{
  id: 'risk_averse_entrepreneurship',
  statementA: 'Values stability and security',
  statementB: 'Drawn to entrepreneurial creation',
  description: 'Profile shows interest in both security AND creation - a common tension',
  frame: 'human_complexity',  // ← New field
  constructiveReframe: [
    "Many successful entrepreneurs manage risk carefully.",
    "Consider: intrapreneurship, funded startups, or side projects",
    "that let you create within a safety net."
  ].join(' '),
}

// Update all contradictions to remove:
// - "Claims" language
// - "But" constructions  
// - Severity labels on personal tensions
// - Add "frame: 'human_complexity'" to all
```

**Update Explanation Generator:**
```typescript
// When presenting contradictions to user

function explainContradiction(contradiction: Contradiction): string {
  return [
    `I notice something interesting in your profile:`,
    "",
    `You show both ${contradiction.statementA} AND ${contradiction.statementB}.`,
    "",
    "This tension is completely normal. Many people navigate similar complexity.",
    "",
    contradiction.constructiveReframe,
    "",
    "There's no right answer here - just different ways to honor both sides."
  ].join('\n');
}
```

---

### □ Fix 5: Increase Emotional Dampening (Risk: Emotion-Triggered Collapse)

**Problem:** +5-8 point adjustments insufficient for severe spikes  
**Solution:** Context-aware adjustments  

```typescript
// File: lib/intelligence/reliability/threshold-calibration.ts

// Update WISE_MENTOR_PROFILE.stabilityRules
{
  anxietySpikeThreshold: 0.70,        // ← Change: 0.75 → 0.70 (earlier intervention)
  anxietyAdjustmentFactor: 12,        // ← Change: 6 → 12 (doubled)
  
  stressSpikeThreshold: 0.75,         // ← Change: 0.80 → 0.75
  stressAdjustmentFactor: 10,         // ← Change: 5 → 10 (doubled)
  
  confidenceCrashThreshold: 0.30,     // ← Change: 0.25 → 0.30
  confidenceAdjustmentFactor: 15,     // ← Change: 8 → 15 (nearly doubled)
}

// Add severity scaling
function calculateEmotionalAdjustment(
  emotionalState: EmotionalState,
  config: StabilityRuleConfig
): number {
  let adjustment = 0;
  
  // Severe anxiety
  if (emotionalState.anxiety > config.anxietySpikeThreshold) {
    const severity = (emotionalState.anxiety - config.anxietySpikeThreshold) / 
                     (1 - config.anxietySpikeThreshold);
    adjustment += config.anxietyAdjustmentFactor * (1 + severity * 2);
  }
  
  // Severe stress
  if (emotionalState.stress > config.stressSpikeThreshold) {
    const severity = (emotionalState.stress - config.stressSpikeThreshold) / 
                     (1 - config.stressSpikeThreshold);
    adjustment += config.stressAdjustmentFactor * (1 + severity * 2);
  }
  
  // Severe confidence crash
  if (emotionalState.confidence < config.confidenceCrashThreshold) {
    const severity = (config.confidenceCrashThreshold - emotionalState.confidence) / 
                     config.confidenceCrashThreshold;
    adjustment += config.confidenceAdjustmentFactor * (1 + severity * 2);
  }
  
  // Cap total adjustment
  return Math.min(adjustment, 30);  // Max 30 point adjustment
}
```

---

## Verification Tests

After implementing fixes, run:

```bash
# 1. Stress test
npx tsx scripts/run-stress-test.ts

# Verify:
# - oscillationRate < 10%
# - averageChangesPerStudent < 3
# - studentsWithManyChanges < 50

# 2. Unit tests
npx vitest run lib/intelligence/reliability/

# 3. Psychological safety audit (manual review)
# Review: explanation-engine.ts output for 5 downgrade scenarios
# Review: contradiction-engine.ts for reframed language
```

---

## Production Readiness Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Oscillation Rate | 86.6% | <10% | □ |
| Changes/Student | 7.38 | <3 | □ |
| Students with >5 changes | 349 | <50 | □ |
| Burnout mode implemented | ❌ No | Yes | □ |
| Gentle downgrades | ❌ No | Yes | □ |
| Contradictions reframed | ❌ No | Yes | □ |

---

## Deployment Sign-Off

**Required Approvals:**

- [ ] Engineering: Stress tests pass with targets
- [ ] Product: UX review of new messaging
- [ ] Psychology: Audit of contradiction reframes
- [ ] QA: Edge case testing (burnout, oscillation, rapid changes)

**Do Not Deploy If:**
- Oscillation rate > 15%
- Any archetype has >30% instability
- Burnout mode not implemented
- Downgrade messaging not softened

---

## Quick Reference: Safe Language Patterns

### ❌ Prohibited
- "You are..." (essentializing)
- "You should..." (prescriptive)
- "You lack..." (deficit)
- "Claims X but Y..." (diagnostic)
- Severity labels on personal traits

### ✅ Required
- "You might explore..." (exploratory)
- "One possibility is..." (suggestive)
- "You may want to develop..." (growth)
- "Profile shows both X AND Y..." (complexity)
- "This tension is normal..." (normalizing)

---

**Last Updated:** 2026-05-27  
**Next Review:** After threshold fixes implemented
