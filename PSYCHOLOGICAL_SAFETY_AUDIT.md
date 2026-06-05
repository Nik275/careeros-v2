# CareerOS Psychological Safety Audit Report

**Auditor:** Psychologist + Decision Systems Auditor  
**Date:** 2026-05-27  
**Scope:** Recommendation reliability layer, user-facing messaging, tier changes  

---

## Executive Summary

**OVERALL RATING: 🟡 MODERATE RISK - NOT PRODUCTION READY**

The CareerOS system demonstrates **sophisticated psychological awareness** in its design, with industry-leading protections including emotional spike dampening, contradiction detection, and psychological state awareness. However, **critical vulnerabilities exist** that could cause significant psychological harm to students, particularly around tier instability and downgrade messaging.

**Production Readiness Score: 64/100**

---

## Audit Methodology

1. **Code Review:** Analyzed recommendation generation, stability rules, explanation engine
2. **Language Analysis:** Evaluated deterministic vs exploratory framing
3. **Stress Test Data:** Leveraged 500-student, 12-month simulation results
4. **Safeguard Assessment:** Reviewed existing protections and gaps
5. **Risk Modeling:** Identified psychological harm vectors

---

## Critical Risks Identified

### 🔴 HIGH RISK (Blocking Production)

#### Risk 1: Catastrophic Oscillation Causes Psychological Whiplash

**Evidence:**
- **86.6%** of students experience tier flipping (A-B-A-B patterns)
- **7.38** average tier changes per student over 12 months
- **349/500** students have >5 changes

**Psychological Harm:**
- Decision paralysis from constant uncertainty
- Erosion of trust in system and self
- Anxiety from never knowing "final answer"
- Learned helplessness - why engage if it keeps changing?

**Root Cause:**
```typescript
// Current: Too permissive
cooldownPeriodMs: 48 * 60 * 60 * 1000,  // 2 days
minSessionsForDirectionalConfirmation: 3,  // 3 sessions

// Needed: Much more conservative
cooldownPeriodMs: 14 * 24 * 60 * 60 * 1000,  // 14 days
minSessionsForDirectionalConfirmation: 6,  // 6 sessions
```

---

#### Risk 2: Burnout Amplification - Kicking Students When They're Down

**Evidence:**
- **51 students (10.2%)** experienced "burnout amplification"
- System continued making tier changes during active burnout/recovery
- No special handling for crisis states

**Psychological Harm:**
- Shame spiral from "failing" at careers while recovering from burnout
- Feeling system doesn't recognize their struggle
- Additional pressure during vulnerable period

**Current Code Gap:**
```typescript
// stability-rules.ts - No burnout mode check
function isPsychologicallySafe(): boolean {
  // Checks volatility, contradictions, but NOT burnout state
  // Should include: if (burnoutScore > 0.7) return false;
}
```

---

#### Risk 3: Harsh Downgrade Messaging Without Soft Landing

**Evidence:**
- Same explanation tone for upgrades and downgrades
- No special handling for dramatic drops
- Language can feel like judgment

**Current Explanation Pattern:**
```typescript
// explanation-engine.ts:458-468
"Engineering recommendation declined because 
   insufficient technical depth, limited problem-solving evidence"
// Feels like: "You failed at engineering"
```

**Psychological Harm:**
- Identity threat - "I'm not cut out for this"
- Shame from "public" (system) judgment
- Discouragement from exploring related paths

---

#### Risk 4: Diagnostic Contradiction Language

**Evidence:**
- Contradictions framed as "Claims X but Y" 
- Severity labels ("critical", "high") on personal tensions
- "But" language implies inconsistency is problematic

**Current Framing:**
```typescript
// contradiction-engine.ts:63-180
{
  id: 'risk_averse_entrepreneurship',
  description: 'Claims money indifference but focuses on prestige careers',
  severity: 'critical',  // ← Labeling personal tension as severe
}
// Feels like: "You're lying or confused about yourself"
```

**Psychological Harm:**
- Self-doubt about identity
- Shame from being "inconsistent"
- Distrust of own intuition

---

### 🟠 MEDIUM RISK

#### Risk 5: Overconfidence in Uncertain Assessments

**Evidence:**
- System generates recommendations with confidence >0.8 despite limited data
- Students may interpret confidence as certainty
- No calibration of confidence accuracy

**Current Behavior:**
```typescript
// Early in journey with limited data
confidence: 0.85,  // High confidence despite knowing student for 1 session
explanation: "Your profile indicates strong engineering fit"
// Student hears: "I should definitely be an engineer"
```

**Psychological Harm:**
- Premature closure on identity exploration
- Pressure to conform to "high confidence" recommendation
- Disappointment if reality differs from prediction

---

#### Risk 6: Identity Invalidation Through Pattern Labeling

**Evidence:**
- Terms like "shiny object syndrome" used internally
- Risk of surfacing in explanations
- Pattern detection can feel like pathologizing

**Current Code:**
```typescript
// mentor-brain.ts:492
pattern: 'shiny_object_syndrome',  // Pathologizing label
// If surfaced to user: "You have shiny object syndrome"
```

**Psychological Harm:**
- Self-pathologizing
- Feeling broken or flawed
- Resistance to legitimate interest changes

---

#### Risk 7: Deterministic Language Despite Uncertainty

**Evidence:**
- Some system prompts use "suggests" language but can drift
- Risk of "Your profile indicates you ARE..." phrasing
- No mandatory uncertainty flags in all outputs

**Vulnerable Pattern:**
```typescript
// system-prompt.ts:252
"Your autonomy score (0.7) suggests high independence needs"
// Better: "Your responses indicate you may value autonomy highly"
```

**Psychological Harm:**
- Self-fulfilling prophecy
- Feeling boxed in by assessment
- Reduced openness to growth/change

---

## Current Safeguards Assessment

### ✅ Strong Safeguards

| Safeguard | Implementation | Effectiveness |
|-----------|---------------|-------------|
| **Emotional spike dampening** | `stability-rules.ts:125-165` - Detects anxiety/stress and suppresses recommendations | 🟡 PARTIAL - Still 46.8% emotion-triggered collapse |
| **Contradiction detection** | `contradiction-engine.ts` - Identifies 10 common psychological contradictions | 🟢 GOOD - Provides constructive reframes |
| **Psychological state awareness** | 12-state machine with tailored mentor approaches | 🟢 GOOD - Adapts tone to emotional state |
| **Anti-essentializing language** | System forbids "You are X" in favor of dimensional scores | 🟢 GOOD - Reduces identity-labeling |
| **Confidence calibration** | Three-tier language system based on confidence | 🟢 GOOD - Appropriate uncertainty signaling |
| **Prohibited phrases list** | Bans motivational fluff, toxic positivity | 🟢 GOOD - Prevents superficial engagement |

### ⚠️ Insufficient Safeguards

| Safeguard | Current State | Needed Improvement |
|-----------|--------------|-------------------|
| **Cooldown periods** | 48 hours | 14 days minimum |
| **Oscillation prevention** | Detects after 2 changes | Block after 1 change |
| **Burnout mode** | ❌ Does not exist | Crisis observation mode |
| **Downgrade softening** | Same tone as upgrades | Gentle reframing mode |
| **Emotional adjustments** | +5-8 points | +15-20 for severe states |

### ❌ Missing Safeguards

| Missing Feature | Why Needed | Priority |
|-----------------|------------|----------|
| **Tier change preview** | Student agency in changes | HIGH |
| **Recovery observation mode** | Protect burned-out students | HIGH |
| **Historical trajectory visualization** | Context reduces panic | MEDIUM |
| **Student override capability** | Agency in face of algorithm | MEDIUM |
| **Post-change check-in** | Assess psychological impact | LOW |

---

## Safe Recommendation Principles

### Principle 1: Stability Over Responsiveness

**Rule:** Students prefer stable "wrong" recommendations over fluctuating "right" ones.

**Implementation:**
- Minimum 14-day cooldown between tier changes
- Require 6+ sessions for any tier change
- Predictive oscillation blocking (prevent A-B-A patterns)

---

### Principle 2: Gentle on Downgrades, Celebratory on Upgrades

**Rule:** Downgrades feel like judgment; upgrades feel like validation. Asymmetric messaging needed.

**Current (Problematic):**
```
"Engineering declined because insufficient technical depth"
```

**Recommended (Safe):**
```
"Your engineering exploration continues. Based on recent sessions, 
 you may want to strengthen technical skills OR explore related paths 
 that use your strengths differently. This is normal exploration."
```

---

### Principle 3: Reframe Contradictions as Human Complexity

**Rule:** Contradictions are normal, not pathology.

**Current (Risky):**
```
"Claims money indifference but focuses on prestige careers"
```

**Recommended (Safe):**
```
"Your profile shows interesting complexity: you prioritize meaning over 
 money AND value recognition. Many successful people navigate this tension. 
 Let's explore careers that satisfy both."
```

---

### Principle 4: Burnout Mode = Observation Only

**Rule:** During crisis states, suppress all demotions and reduce recommendation confidence.

**Implementation:**
```typescript
if (burnoutScore > 0.7 || stress > 0.85) {
  return {
    mode: 'RECOVERY_OBSERVATION',
    suppressTierChanges: true,
    message: "Taking time to understand your experience. 
              Focus on recovery - career clarity will follow.",
  };
}
```

---

### Principle 5: Confidence Proportional to Data

**Rule:** High confidence requires high data volume + high consistency.

**Current:**
```
Confidence: 0.85 (after 2 sessions)
```

**Recommended:**
```
Confidence: 0.85 (requires 10+ sessions + low contradiction)
Confidence: 0.60 (with 2 sessions - labeled "preliminary")
```

---

### Principle 6: Exploratory Over Deterministic Language

**Rule:** Always leave room for student agency and growth.

**Prohibited Phrases:**
- "You are..." (essentializing)
- "You should..." (prescriptive)
- "Your ideal career is..." (deterministic)
- "You lack..." (deficit framing)

**Required Phrases:**
- "You might explore..." (exploratory)
- "One possibility is..." (suggestive)
- "Your profile indicates an interest in..." (descriptive)
- "You may want to develop..." (growth-oriented)

---

## Production Readiness Score: 64/100

### Scoring Breakdown

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| **Stability** | 15/25 | 25 | 86.6% oscillation rate catastrophic |
| **Burnout Protection** | 5/15 | 15 | No burnout mode exists |
| **Language Safety** | 18/20 | 20 | Generally good, minor gaps |
| **Downgrade Handling** | 8/15 | 15 | No soft landing implemented |
| **Confidence Calibration** | 12/15 | 15 | Good system, may overestimate |
| **Identity Respect** | 6/10 | 10 | Contradiction framing risky |
| **TOTAL** | **64** | **100** | **Not production ready** |

---

## Deployment Requirements

### Must Fix (Blocking)

1. **Reduce oscillation rate below 10%**
   - Increase cooldown to 14 days
   - Require 6 sessions for changes
   - Implement predictive blocking

2. **Implement burnout protection mode**
   - Detect burnout/high stress states
   - Suppress demotions during recovery
   - Special messaging for crisis states

3. **Soften downgrade messaging**
   - Create "gentle downgrade" explanation mode
   - Emphasize exploration over rejection
   - Provide alternative pathways

4. **Reframe contradiction language**
   - Remove "claims/but" constructions
   - Normalize tension as human complexity
   - Constructive reframes only

### Should Fix (High Priority)

5. **Increase emotional dampening**
   - Double adjustment factors for severe states
   - Context-aware (anxiety vs burnout different)

6. **Add tier change preview**
   - Give students agency in accepting changes
   - Explain rationale before applying

### Nice to Have (Medium Priority)

7. **Historical trajectory visualization**
8. **Student override capability**
9. **Post-change psychological check-in**

---

## Risk Summary Matrix

| Risk | Severity | Likelihood | Impact | Mitigation Status |
|------|----------|------------|--------|-------------------|
| Oscillation whiplash | 🔴 Critical | 86.6% | Trust destruction | ⚠️ Partial |
| Burnout amplification | 🔴 Critical | 10.2% | Shame spiral | ❌ None |
| Harsh downgrades | 🔴 High | Common | Identity threat | ⚠️ Partial |
| Diagnostic contradictions | 🟠 High | Common | Self-doubt | ⚠️ Partial |
| Overconfidence | 🟠 Medium | Common | Premature closure | ⚠️ Partial |
| Identity labeling | 🟡 Medium | Low | Pathologizing | ✅ Good |
| Deterministic language | 🟡 Low | Low | Self-fulfilling | ✅ Good |

---

## Conclusion

CareerOS has **strong foundational psychological awareness** but **critical execution gaps** that would cause real harm if deployed.

### The Good
- Sophisticated emotional spike detection
- Robust psychological state machine
- Anti-essentializing language guidelines
- Contradiction detection with constructive reframes

### The Bad
- 86.6% oscillation rate destroys trust
- No protection for students in crisis
- Downgrades feel like judgment

### The Fixable
All critical issues can be resolved through:
1. Threshold hardening (14-day cooldown, 6-session confirmation)
2. Burnout mode implementation
3. Language reframing in contradiction engine
4. Gentle downgrade messaging

**Recommendation:** Do not deploy until oscillation rate <10% and burnout mode implemented.

---

## Appendix: Key Files Reviewed

| File | Purpose | Risk Level |
|------|---------|------------|
| `stability-rules.ts` | Psychological safety checks | 🔴 Oscillation handling insufficient |
| `tier-hysteresis.ts` | Tier change logic | 🔴 Cooldown too short |
| `explanation-engine.ts` | User-facing messages | 🟠 Downgrade messaging harsh |
| `contradiction-engine.ts` | Contradiction detection | 🟠 Diagnostic language |
| `system-prompt.ts` | LLM instructions | 🟢 Generally safe |
| `confidence-calibrator.ts` | Confidence presentation | 🟢 Good uncertainty signaling |
| `psychological-state-machine.ts` | State awareness | 🟢 Sophisticated implementation |

---

*This audit was conducted with student wellbeing as the primary metric. Technical elegance and recommendation accuracy are secondary to psychological safety.*
