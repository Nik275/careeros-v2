# CareerOS Safety Layer — Integration Guide

## Overview

The Safety Layer transforms CareerOS from **fake-smart** to **intellectually honest**.

### What It Does

1. **Detects Insufficient Data** — Blocks recommendations when evidence is sparse
2. **Prevents Hallucinations** — Asks clarifying questions instead of assuming
3. **Calibrates Confidence** — Replaces fake percentages with evidence-based confidence
4. **Transforms Language** — Removes certainty theater, adds appropriate uncertainty

### Before vs After

| Scenario | Before (Dangerous) | After (Safe) |
|----------|-------------------|--------------|
| Student says "idk" | "Psychological fit: 78%" | "We're still early here. What feels most on your mind?" |
| "I like medicine" | Recommends medicine path | "What part of medicine pulls you in?" |
| "I want IIT" | Assumes capability | "What draws you to IIT specifically?" |
| Contradictory input | Ignores contradictions | "I'm noticing some tension worth exploring..." |
| Crisis state | Gives career advice | "I want to pause here. What's feeling hardest?" |

---

## Quick Start

### 1. Initialize the Safety Engine

```typescript
import { createConfidenceCalibrationEngine } from './safety';

const safetyEngine = createConfidenceCalibrationEngine();
```

### 2. Assess Before Every Response

```typescript
// Before generating any response
const safetyAssessment = safetyEngine.assessSafety(studentId, {
  message: studentMessage,
  profile: studentProfile,
  emotionalState: detectedEmotionalState,
  conversationCount: sessionCount,
  // ... other context
});

// Check if safe to proceed
if (!safetyAssessment.canProceed) {
  // Return exploration response instead
  return safetyAssessment.alternativeApproach;
}
```

### 3. Calibrate Your Response

```typescript
// Generate your normal response
const originalResponse = await generateMentorResponse(studentId, message);

// Calibrate it
const calibrated = safetyEngine.calibrateResponse(
  studentId,
  originalResponse,
  safetyAssessment
);

// Use calibrated response
return calibrated.calibratedResponse;
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 CONFIDENCE CALIBRATION ENGINE                │
│                      (Main Orchestrator)                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Insufficient │   │ Hallucination    │   │ Uncertainty      │
│ Data         │   │ Resistance       │   │ Language         │
│ Detector     │   │ Engine           │   │ Engine           │
└──────────────┘   └──────────────────┘   └──────────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Data Quality │   │ Clarifying       │   │ Language         │
│ Assessment   │   │ Questions        │   │ Transformation   │
└──────────────┘   └──────────────────┘   └──────────────────┘
```

---

## Key Concepts

### 1. Data Quality Score (0-100)

| Score | Level | Action |
|-------|-------|--------|
| 0-30 | Critical | Block all recommendations, support mode |
| 30-50 | Low | Exploration mode, no recommendations |
| 50-70 | Medium | Guided exploration, tentative suggestions |
| 70-90 | High | Can recommend with caveats |
| 90-100 | Very High | Confident recommendations (rare) |

### 2. Hallucination Risk Levels

| Level | Example | Action |
|-------|---------|--------|
| CRITICAL | Crisis state | Block, redirect to support |
| HIGH | "I want IIT" with no context | Ask clarifying question |
| MEDIUM | Vague interest | Probe deeper |
| LOW | Clear statement | Proceed with mild calibration |

### 3. Uncertainty Language Levels

| Level | Confidence | Example Prefix |
|-------|------------|----------------|
| VERY_LOW | 90-100% | "I'm quite confident that..." |
| LOW | 70-90% | "I'm noticing..." |
| MEDIUM | 50-70% | "I wonder if..." |
| HIGH | 30-50% | "I'm not sure, but..." |
| VERY_HIGH | 0-30% | "I really don't know, but..." |

---

## Usage Examples

### Example 1: Vague Input

```typescript
const input = {
  message: "idk what to do",
  profile: {},
  emotionalState: 'CONFUSED',
  conversationCount: 1,
};

const safety = safetyEngine.assessSafety('student-1', input);

// Result:
// safety.canProceed = false
// safety.recommendedConfidenceLevel = 25
// safety.explorationMode.mode = 'GENTLE_DISCOVERY'
// safety.clarifyingQuestions = ["What feels most on your mind right now?"]
```

### Example 2: Contradictory Input

```typescript
const input = {
  message: "I want to be a doctor but I hate blood",
  profile: {},
  emotionalState: 'CONFUSED',
  conversationCount: 2,
};

const safety = safetyEngine.assessSafety('student-1', input);

// Result:
// safety.hallucinationRisk.hasRisks = true
// safety.hallucinationRisk.risks[0].pattern = 'medical_interest'
// safety.hallucinationRisk.clarifyingQuestions[0] = 
//   "What part of medicine actually pulls you in?"
```

### Example 3: Crisis State

```typescript
const input = {
  message: "I can't do this anymore",
  profile: {},
  emotionalState: 'CRISIS',
  anxietyLevel: 95,
  conversationCount: 1,
};

const safety = safetyEngine.assessSafety('student-1', input);

// Result:
// safety.canProceed = false
// safety.blockedReason = "Critical concern: Emotional Instability"
// safety.explorationMode.mode = 'SUPPORT_FIRST'
```

### Example 4: Calibrating a Response

```typescript
const originalResponse = {
  type: 'RECOMMENDATION',
  mentorMessage: 'You should pursue engineering. Your fit is 85%.',
  recommendations: [{
    id: '1',
    title: 'Engineering',
    confidence: 85,
    description: 'Engineering is perfect for you.'
  }],
  confidenceScores: { overall: 85 }
};

const safety = safetyEngine.assessSafety('student-1', input);
const calibrated = safetyEngine.calibrateResponse(
  'student-1',
  originalResponse,
  safety
);

// Result:
// calibrated.calibratedResponse.mentorMessage = 
//   "I wonder if engineering might be worth exploring. From what I can see, 
//    there could be some alignment, though I might be wrong."
// calibrated.calibratedResponse.recommendations[0].confidence = 50
// calibrated.confidenceAdjustedFrom = 85
// calibrated.confidenceAdjustedTo = 50
```

---

## Configuration

### Adjusting Sensitivity

```typescript
// Stricter mode (more conservative)
const strictEngine = createConfidenceCalibrationEngine({
  confidenceThreshold: 60,  // Higher threshold
  requireLongitudinalData: true,
  maxClarifyingQuestions: 3,
});

// Lenient mode (for established relationships)
const lenientEngine = createConfidenceCalibrationEngine({
  confidenceThreshold: 40,
  requireLongitudinalData: false,
  maxClarifyingQuestions: 1,
});
```

### Custom Hallucination Patterns

```typescript
const engine = createHallucinationResistanceEngine();

engine.addPattern({
  id: 'my_custom_pattern',
  trigger: 'specific phrase',
  dangerousAssumption: 'What you assume',
  clarifyingQuestion: 'What to ask instead',
  riskLevel: 'HIGH'
});
```

---

## Testing

### Run All Safety Tests

```bash
npm test src/intelligence/safety/HallucinationResistance.test.ts
```

### Test Coverage

- ✅ 100+ adversarial test cases
- ✅ Vague input handling
- ✅ Contradictory input handling
- ✅ Missing data detection
- ✅ Emotional crisis detection
- ✅ Language transformation
- ✅ Confidence calibration
- ✅ Edge cases

---

## Safety Checklist

Before deploying any response:

- [ ] Run `assessSafety()` first
- [ ] Check `canProceed` flag
- [ ] If blocked, use `alternativeApproach`
- [ ] If proceeding, run `calibrateResponse()`
- [ ] Verify no certainty theater remains
- [ ] Ensure confidence < 70% for new students
- [ ] Add clarifying questions for hallucination risks
- [ ] Test with crisis inputs

---

## Monitoring

Track these metrics:

```typescript
const status = safetyEngine.getCalibrationStatus(studentId);

// Monitor:
// - status.languageTransformations (should increase)
// - status.averageConfidenceCalibration (should decrease from defaults)
// - status.hallucinationRisksIdentified (should be caught early)
```

### Red Flags

- Zero language transformations = Not using safety layer
- High average confidence (>70%) = Overconfident
- Zero blocked recommendations = Not blocking enough

---

## Best Practices

### DO

- Always assess safety before responding
- Embrace uncertainty in language
- Ask clarifying questions liberally
- Block recommendations when in doubt
- Acknowledge what you don't know

### DON'T

- Skip safety assessment
- Use percentages without evidence
- Claim certainty about the future
- Ignore contradictions
- Use diagnostic language ("obsessed", "dysfunctional")

---

## Integration with Existing Systems

### With Mentor Engine

```typescript
// Before
const response = mentorEngine.generateResponse(input);

// After
const safety = safetyEngine.assessSafety(id, input);
const rawResponse = mentorEngine.generateResponse(input);
const response = safety.canProceed 
  ? safetyEngine.calibrateResponse(id, rawResponse, safety).calibratedResponse
  : generateExplorationResponse(safety);
```

### With Career Cascade

```typescript
// Before
const path = careerCascade.recommendPath(profile);

// After
const safety = safetyEngine.assessSafety(id, input);
if (!safety.canProceed) {
  return { type: 'EXPLORATION', message: 'Need more information' };
}
const path = careerCascade.recommendPath(profile);
const safePath = validateRecommendation(path, safety);
```

---

## Troubleshooting

### Issue: Too Many Blocked Recommendations

**Solution:** Adjust confidence threshold or improve data collection onboarding.

### Issue: Students Frustrated by Questions

**Solution:** Frame clarifying questions as mentor curiosity, not interrogation.

### Issue: Confidence Still Too High

**Solution:** Check that `calibrateResponse()` is being called and language engine is active.

### Issue: Crisis Not Detected

**Solution:** Verify emotional state detection is feeding into safety assessment.

---

## Summary

The Safety Layer ensures CareerOS:

1. **Never hallucinates certainty**
2. **Always acknowledges uncertainty**
3. **Blocks unsafe recommendations**
4. **Asks instead of assumes**
5. **Protects students from overconfidence**

**Use it on EVERY interaction. No exceptions.**
