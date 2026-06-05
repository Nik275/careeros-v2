# CareerOS Market Intelligence - Market Integration Layer

## Phase 1.7: Market Intelligence Integration

**Purpose:** Connect Market Intelligence with CareerOS Decision Architecture.

**Core Principle:** Market intelligence is a modifier, not a primary decision-maker.

---

## Priority Order

1. **Psychological Fit** (30% weight)
2. **Values Alignment** (20% weight)
3. **Utility** (20% weight)
4. **Optionality** (10% weight)
5. **Future Resilience** (10% weight)
6. **Market Intelligence** (10% weight) ← Modifier only

---

## Architecture

```
market/integration/
├── models/
│   └── MarketAwareCareerAnalysis.ts
├── MarketAdjustmentEngine.ts
├── MarketOpportunityBoost.ts
├── MarketRiskAdjustment.ts
├── MarketNarrativeEngine.ts
├── MarketRecommendationAudit.ts
├── index.ts
└── MARKET_INTEGRATION.md
```

---

## Components

### 1. MarketAwareCareerAnalysis

Combines base scores with market intelligence to produce final recommendation.

```typescript
interface MarketAwareCareerAnalysis {
  // Base scores (primary decision factors)
  fitScore: number;           // Psychological fit (highest priority)
  valuesScore: number;        // Values alignment
  utilityScore: number;       // Practical utility
  optionalityScore: number;   // Career optionality
  resilienceScore: number;    // Future resilience

  // Market modifier
  marketScore: number;        // Market conditions
  marketAdjustment: number;   // Applied adjustment (+/-)

  // Final calculation
  finalScore: number;
  confidence: number;

  // Audit trail
  marketDriven: boolean;      // Flag if market is primary driver
}
```

**Default Weights:**
```typescript
const DEFAULT_SCORE_WEIGHTS = {
  fit: 0.3,        // Primary - psychological fit
  values: 0.2,     // Secondary - values alignment
  utility: 0.2,    // Tertiary - practical utility
  optionality: 0.1, // Fourth - career optionality
  resilience: 0.1,  // Fifth - future resilience
  market: 0.1,      // Last - market modifier
};
```

### 2. MarketAdjustmentEngine

Adjusts confidence, opportunity estimates, and future resilience based on market conditions.

**Key Behaviors:**
- Positive adjustment when market score > 70
- Negative adjustment when market score < 50
- Trend adjustments for improving/declining markets
- Volatility penalties for uncertain markets

**Configuration:**
```typescript
const DEFAULT_ADJUSTMENT_CONFIG = {
  maxConfidenceAdjustment: 10,
  maxOpportunityAdjustment: 15,
  maxResilienceAdjustment: 10,
  positiveThreshold: 70,
  negativeThreshold: 50,
};
```

### 3. MarketOpportunityBoost

Increases confidence when BOTH fit and market are strong.

**Conditions for Boost:**
- Fit score >= 75 (strong fit)
- Market score >= 75 (strong market)
- Base confidence >= 70

**Result:**
- Up to +8 point confidence boost
- Explanation: "Strong fit and favorable market conditions increase recommendation confidence"

**Never recommends solely because of market demand.**

### 4. MarketRiskAdjustment

Reduces confidence and explains risks when fit is strong but market is weak.

**Principle:** Strong fit justifies recommendation even in weak markets, but confidence should reflect reality.

**Conditions:**
- Fit score >= 75 (strong fit)
- Market score <= 50 (weak market)

**Result:**
- Confidence penalty of 3-12 points
- Risk level assessment (low/moderate/significant/high)
- Mitigation strategies
- Explanation: "Despite challenging market conditions, strong fit justifies recommendation"

### 5. MarketNarrativeEngine

Generates human-readable explanations about:
- Why market conditions matter
- Why they do not dominate decisions
- How fit and market interact

**Output Sections:**
- Primary recommendation explanation
- Market context
- Why fit matters more than market
- Confidence explanation
- Risk considerations

**Example Output:**
```
Recommendation: Cybersecurity Engineer

Primary driver: Psychological Fit
Score breakdown:
- Psychological Fit: 88/100
- Values Alignment: 82/100
- Utility: 84/100
- Market Conditions: 82/100

Final Score: 86/100 (91% confidence)

Market Context:
Current market conditions are highly favorable for Cybersecurity Engineer.
Strong demand, competitive salaries, and growth opportunities support this path.

Why fit matters more:
While market conditions provide important context, psychological fit remains the
primary factor in career satisfaction and long-term success.

Your fit score of 88/100 indicates strong alignment with the core demands of
this career. This excellent fit suggests you would thrive regardless of market
fluctuations.
```

### 6. MarketRecommendationAudit

Verifies that no recommendation is being driven primarily by market demand.

**Audit Checks:**
1. Minimum fit threshold (default: 50)
2. Market weight not excessive (max: 0.15)
3. Fit weight sufficient (min: 0.25)
4. Market not dominating fit
5. No low-fit/high-market combinations

**Audit Result:**
```typescript
interface AuditResult {
  passed: boolean;
  severity: 'none' | 'minor' | 'moderate' | 'critical';
  issues: AuditIssue[];
  auditScore: number;      // 0-100
  marketDriven: boolean;   // Flag for review
}
```

---

## Usage Examples

### Basic Integration

```typescript
import {
  createMarketAwareAnalysis,
  createMarketAdjustmentEngine,
  createMarketOpportunityBoost,
  createMarketNarrativeEngine,
  createMarketRecommendationAudit,
} from './integration';

// Create analysis with market integration
const analysis = createMarketAwareAnalysis({
  careerId: 'cybersecurity-engineer',
  careerTitle: 'Cybersecurity Engineer',
  fitScore: 88,
  valuesScore: 82,
  utilityScore: 84,
  optionalityScore: 75,
  resilienceScore: 80,
  marketScore: 82,
  primaryReasons: ['Strong problem-solving alignment', 'Values security and protection'],
});

// Apply opportunity boost
const boost = createMarketOpportunityBoost();
const boosted = boost.applyBoost(analysis);

// Generate narrative
const narrative = createMarketNarrativeEngine();
const explanation = narrative.generateNarrative(analysis);

// Audit recommendation
const audit = createMarketRecommendationAudit();
const auditResult = audit.audit(analysis);

console.log(auditResult.passed ? '✓ PASSED' : '✗ FAILED');
console.log(auditResult.marketDriven ? '⚠️ Market-driven - verify fit' : '✓ Fit-driven');
```

### Batch Processing

```typescript
const analyses = [career1, career2, career3, career4];

// Audit all
const batchAudit = audit.auditBatch(analyses);

console.log(`Passed: ${batchAudit.summary.passedCount}/${batchAudit.summary.totalAudited}`);
console.log(`Market-driven: ${batchAudit.summary.marketDrivenCount}`);

// Find at-risk recommendations
const atRisk = analyses.filter((a) => audit.needsManualReview(a));
```

### Output Example

```
Cybersecurity Engineer

Fit: 88
Utility: 84
Market: 82
Final: 86
Confidence: 91

Explanation:
Recommendation driven primarily by strong fit and utility.
Current market conditions strengthen confidence.

Audit: ✓ PASSED
Confidence is fit-driven, not market-driven.
```

---

## Design Principles

### 1. Modifier, Not Driver
- Market never exceeds 10-15% of final score
- Fit always has highest weight (minimum 25%)
- Market-driven recommendations are flagged for review

### 2. Context, Not Direction
- Market provides context for decision
- Strong fit + weak market = still recommended (with risk notes)
- Weak fit + strong market = not recommended

### 3. Explainable
- Every adjustment has explanation
- Narrative explains why fit matters more
- Audit trail shows decision factors

### 4. Safe Defaults
- Conservative market weight (10%)
- Minimum fit threshold (50)
- Automatic audit on generation

### 5. Human Oversight
- Market-driven flags require review
- Audit failures block recommendation
- Manual review prompts for edge cases

---

## Integration Points

### Consumes From:
- Market Forecasting (forecasts, scenarios, confidence)
- Career Intelligence (fit scores, values alignment)
- Utility Intelligence (utility scores)
- Future Intelligence (resilience scores)

### Feeds To:
- Decision Intelligence (adjusted scores)
- Recommendation Engine (final scores)
- User Interface (narratives, explanations)

---

## Anti-Patterns (Prevented)

### ❌ Market-Only Recommendation
```typescript
// BLOCKED by audit
{
  fitScore: 45,        // Below threshold
  marketScore: 95,     // High demand
  // Audit fails: insufficient_fit
}
```

### ❌ Market-Dominated Scoring
```typescript
// BLOCKED by audit
{
  weights: {
    fit: 0.2,
    market: 0.4,       // Exceeds maximum
    // Audit fails: weight_misconfiguration
  }
}
```

### ❌ Low Fit, High Market
```typescript
// FLAGGED for review
{
  fitScore: 60,        // Moderate fit
  marketScore: 85,     // Strong market
  // Audit warning: low_fit_high_market
}
```

---

## Configuration

### Strict Mode (Recommended)
```typescript
const strictAudit = createMarketRecommendationAudit({
  minFitThreshold: 65,
  maxMarketWeight: 0.1,
  minFitWeight: 0.35,
});
```

### Permissive Mode (Development Only)
```typescript
const permissiveAudit = createMarketRecommendationAudit({
  minFitThreshold: 50,
  maxMarketWeight: 0.2,
  minFitWeight: 0.25,
});
```

---

## Testing

### Unit Tests
- Weight validation
- Score calculation accuracy
- Audit rule compliance

### Integration Tests
- End-to-end flow from scores to recommendation
- Audit catching market-driven recommendations
- Narrative generation quality

### Audit Tests
- Verify market-driven detection
- Verify threshold enforcement
- Verify weight compliance
