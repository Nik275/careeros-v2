# CareerOS Market Intelligence - Market Forecasting Layer

## Phase 1.6: Market Forecasting & Scenario Intelligence

**Purpose:** Estimate future market conditions using historical market intelligence.

**Core Principle:** Never output deterministic predictions. Always output scenarios with confidence and uncertainty.

---

## Architecture Overview

```
ForecastEngine (Main Orchestrator)
├── CareerForecastEngine
├── SkillForecastEngine
├── IndustryForecastEngine
├── RegionForecastEngine
├── ScenarioGenerator
├── ConfidenceForecastEngine
└── ForecastValidationEngine
```

---

## Core Concepts

### Forecast Model

Every forecast represents probabilistic future projections, never certainties.

```typescript
interface Forecast {
  entityId: string;
  entityType: 'career' | 'skill' | 'industry' | 'region';
  horizon: '1_year' | '3_year' | '5_year' | '10_year';

  // Three scenarios
  optimisticScenario: ForecastScenario;
  baselineScenario: ForecastScenario;
  pessimisticScenario: ForecastScenario;

  // Confidence assessment
  confidence: ForecastConfidence;

  // Expected values (probability-weighted)
  expectedValue: {
    demand: ForecastRange;
    salary: ForecastRange;
    growth: ForecastRange;
    opportunity: ForecastRange;
  };
}
```

### Scenarios

Instead of a single prediction, forecasts provide three scenarios:

1. **Optimistic** - Favorable conditions materialize
2. **Baseline** - Most likely conditions
3. **Pessimistic** - Unfavorable conditions emerge

Each scenario includes:
- Projections (demand, salary, growth, opportunity)
- Narrative explanation
- Key assumptions
- Critical factors
- Risk factors

### Forecast Confidence

Confidence is calculated from multiple factors:

- **Data Quality** (25%) - Historical data completeness and reliability
- **Historical Consistency** (20%) - Stability of past patterns
- **Trend Persistence** (25%) - Consistency of current trends
- **Signal Strength** (20%) - Strength of market signals
- **Model Fit** (10%) - How well the model fits the data

---

## Forecast Engines

### 1. Career Forecast Engine

Forecasts career-specific metrics:
- Career demand
- Career growth
- Career opportunity
- Career resilience

**Example:**
```typescript
const result = engine.forecastCareer({
  careerId: 'software-engineer',
  title: 'Software Engineer',
  historicalDemand: [/* trend data */],
  automationRisk: 25,
  resilienceIndicators: {
    skillTransferability: 85,
    educationBarrier: 40,
    geographicFlexibility: 90
  }
}, '3_year');

// Result includes:
// - Three scenarios with demand projections
// - Confidence score with factor breakdown
// - Risk assessment (automation, saturation, etc.)
// - Peer comparison
```

### 2. Skill Forecast Engine

Forecasts skill-specific metrics:
- Future skill demand
- Future skill scarcity
- Future skill relevance

Provides investment recommendations:
- **high_priority** - Strong demand, low obsolescence
- **valuable** - Good demand, manageable obsolescence
- **optional** - Moderate demand or uncertain
- **low_priority** - Declining demand or high obsolescence

### 3. Industry Forecast Engine

Forecasts industry-specific metrics:
- Industry expansion
- Hiring demand
- Investment activity

Provides:
- Expansion likelihood and magnitude
- Investment outlook
- Key growth drivers
- Risk assessment

### 4. Region Forecast Engine

Forecasts geographic metrics:
- City growth
- Regional opportunity
- Remote opportunity growth

Includes cost-of-living adjustments for meaningful comparisons.

---

## Scenario Generation

The `ScenarioGenerator` creates consistent scenario sets:

```typescript
const scenarios = generator.generateScenarios({
  baseDemand: 75,
  baseGrowth: 60,
  trendDirection: 'positive',
  trendStrength: 65,
  volatility: 20,
  upsideFactors: ['AI adoption', 'Remote work normalization'],
  downsideFactors: ['Economic recession', 'Automation acceleration'],
  assumptions: ['Economic conditions remain stable'],
  evidence: ['Job postings up 30%', 'Skills demand increasing']
});

// Returns { optimistic, baseline, pessimistic }
// Each with projections 10-15 points apart based on volatility
```

---

## Confidence Calculation

Confidence decreases with:
- Lower data quality
- Higher historical volatility
- Shorter trend observation periods
- Weaker signals
- Longer forecast horizons

```typescript
const confidence = engine.calculateConfidence({
  historicalData: [/* time series */],
  evidence: [/* supporting evidence */],
  signals: [/* market signals */],
  modelFit: 78,
  horizonYears: 3
});

// Returns:
// - overall: 0-100 score
// - factors: breakdown by component
// - level: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low'
// - recommendation: actionable guidance
// - limitations: factors reducing confidence
// - improvementStrategies: ways to improve
```

---

## Forecast Validation

The validation engine tracks forecast accuracy over time:

```typescript
// Validate a forecast against actual outcomes
const validation = engine.validateForecast(forecast, {
  demand: 82,
  salary: 78,
  growth: 65
});

// Returns:
// - accuracyScore: 0-100
// - withinRange: whether actual fell within forecast range
// - closestScenario: which scenario was most accurate
// - confidenceCalibration: how well predicted confidence matched actual accuracy
```

### Calibration Metrics

Tracks whether confidence scores are well-calibrated:
- 90% confidence forecasts should be ~90% accurate
- Identifies overconfidence or underconfidence
- Provides recommendations for calibration

---

## Usage Examples

### Basic Forecast

```typescript
import { createForecastEngine } from './forecasting';

const engine = createForecastEngine();

// Generate career forecast
const careerForecast = engine.forecastCareer({
  careerId: 'cybersecurity-engineer',
  title: 'Cybersecurity Engineer',
  historicalDemand: [
    { timestamp: new Date('2023-01'), value: 72 },
    { timestamp: new Date('2023-06'), value: 76 },
    { timestamp: new Date('2024-01'), value: 81 },
  ],
  historicalSalary: [/* ... */],
  growthTrend: [/* ... */],
  signals: [
    { timestamp: new Date(), type: 'hiring_surge', strength: 85, direction: 'positive' },
  ],
  evidence: [/* evidence objects */],
  relatedSkills: ['Network Security', 'Penetration Testing'],
  industryAlignment: ['Cybersecurity', 'Enterprise Software'],
  automationRisk: 15,
  resilienceIndicators: {
    skillTransferability: 70,
    educationBarrier: 60,
    geographicFlexibility: 85
  }
}, '3_year');

console.log(careerForecast.forecast.baselineScenario.demandProjection);
// 84 (projected demand score)

console.log(careerForecast.forecast.confidence.overall);
// 81 (confidence in this forecast)

console.log(careerForecast.forecast.pessimisticScenario.demandProjection);
// 74 (demand in worst-case scenario)
```

### Batch Forecasts

```typescript
const results = engine.generateBatchForecasts({
  careers: [career1, career2, career3],
  skills: [skill1, skill2],
  horizon: '5_year'
});

console.log(results.summary);
// {
//   totalForecasts: 5,
//   highConfidenceCount: 3,
//   averageConfidence: 74,
//   processingTime: 245
// }
```

### Compare Entities

```typescript
const comparison = engine.compareForecasts({
  careers: [
    { careerId: 'sw-eng', forecast: swEngForecast },
    { careerId: 'data-sci', forecast: dataSciForecast },
    { careerId: 'product-mgr', forecast: pmForecast }
  ]
});

console.log(comparison.topPerformers);
// Ranked list of best opportunities
```

---

## Design Principles

### 1. Probabilistic, Not Deterministic
- Never present single-point predictions as certainties
- Always provide scenario ranges
- Include confidence assessments

### 2. Explicit Uncertainty
- Forecast ranges show uncertainty bounds
- Confidence scores quantify reliability
- Horizon adjustments reflect decaying certainty

### 3. Explainable
- Every scenario has narrative explanation
- Confidence factors are transparent
- Assumptions are documented

### 4. Validatable
- Forecasts tracked against reality
- Calibration metrics enable improvement
- Drift detection identifies model degradation

### 5. Multi-Horizon
- 1-year tactical forecasts
- 3-year strategic forecasts
- 5-year directional forecasts
- 10-year exploratory forecasts

---

## Output Example

### Cybersecurity Engineer - 3-Year Outlook

**Optimistic Scenario (25% probability):**
- Demand: 92
- Growth: 88
- Assumptions: Enterprise security spending accelerates, AI security demands emerge

**Baseline Scenario (50% probability):**
- Demand: 84
- Growth: 75
- Assumptions: Steady security investment, regulatory requirements increase

**Pessimistic Scenario (25% probability):**
- Demand: 74
- Growth: 65
- Assumptions: Economic downturn, automation reduces entry-level roles

**Confidence: 81/100**
- Data Quality: 85
- Historical Consistency: 78
- Trend Persistence: 82
- Signal Strength: 80
- Model Fit: 75

**Risk Factors:**
- Low automation risk (15/100)
- Moderate education barrier
- Strong geographic flexibility

---

## Files

```
src/intelligence/market/forecasting/
├── ForecastEngine.ts                 # Main orchestrator
├── CareerForecastEngine.ts           # Career forecasting
├── SkillForecastEngine.ts            # Skill forecasting
├── IndustryForecastEngine.ts         # Industry forecasting
├── RegionForecastEngine.ts           # Region forecasting
├── ScenarioGenerator.ts              # Scenario generation
├── ConfidenceForecastEngine.ts       # Confidence calculation
├── ForecastValidationEngine.ts       # Accuracy tracking
├── index.ts                          # Exports
├── MARKET_FORECASTING.md             # This documentation
└── models/
    ├── Forecast.ts                   # Core forecast model
    ├── ForecastScenario.ts           # Scenario model
    ├── ForecastRange.ts              # Probabilistic ranges
    ├── ForecastConfidence.ts         # Confidence assessment
    ├── ForecastEvidence.ts           # Evidence tracking
    └── index.ts                      # Model exports
```

---

## Integration

### Feeds To:
- Future Simulation Engine
- Decision Intelligence
- Market-Aware Recommendations
- Career Profiles
- Opportunity Scoring

### Consumes From:
- Market Profiles (historical data)
- Trend Intelligence (trend signals)
- Discovery Intelligence (emerging signals)
- Market Signals (real-time indicators)

---

## Engineering Notes

### Strict TypeScript
- All models fully typed
- No `any` types
- Discriminated unions for scenario types

### Performance
- Forecast caching with TTL
- Batch processing support
- Lazy validation

### Extensibility
- Configurable horizons
- Pluggable scenario generators
- Custom confidence factors

### Testing
- Synthetic data generation
- Backtesting framework
- Calibration tracking
