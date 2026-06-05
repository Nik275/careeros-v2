# Career Market Profile Engine

## Overview

The Career Market Profile Engine transforms raw market signals into actionable career intelligence.

### Core Rule

> **No other module should reason from raw market data.**
>
> Everything must become `CareerMarketProfile` before entering the recommendation system.

## Architecture

```
MarketSignals
      ↓
CareerMarketProfileEngine
      ↓
[Individual Scoring Engines]
      ↓
CareerMarketProfile
      ↓
Recommendation Systems
```

## Directory Structure

```
profile/
├── CareerMarketProfileEngine.ts     # Main orchestrator
├── DemandScoringEngine.ts           # Labor demand calculation
├── SalaryScoringEngine.ts           # Economic attractiveness
├── GrowthScoringEngine.ts           # Career expansion
├── ScarcityScoringEngine.ts         # Talent shortage
├── AutomationRiskEngine.ts          # Disruption risk
├── FutureResilienceEngine.ts        # Long-term survivability
├── OpportunityScoringEngine.ts      # Overall assessment
├──
├── models/
│   ├── CareerMarketProfile.ts       # Profile model
│   ├── MarketScoreBreakdown.ts      # Explainability
│   └── OpportunityAnalysis.ts       # SWOT analysis
│
├── index.ts                         # Public exports
└── docs/
    └── CAREER_MARKET_PROFILE_ENGINE.md (this file)
```

## Career Market Profile

### Interface

```typescript
interface CareerMarketProfile {
  // Identity
  id: CareerMarketProfileId;
  careerId: string;

  // Core Scores (0-100)
  demandScore: number;
  salaryScore: number;
  growthScore: number;
  scarcityScore: number;
  automationRiskScore: number;
  futureResilienceScore: number;
  opportunityScore: number;

  // Confidence
  confidence: number;
  confidenceBreakdown: {
    demandConfidence: number;
    salaryConfidence: number;
    growthConfidence: number;
    scarcityConfidence: number;
    automationRiskConfidence: number;
    resilienceConfidence: number;
  };

  // Metadata
  version: number;
  lastUpdated: Date;
  dataFreshness: number;
  signalCount: number;
  sourceCount: number;

  // Analysis
  outlook: MarketOutlook; // 'excellent' | 'good' | 'neutral' | 'caution' | 'poor'
  trendDirection: 'improving' | 'stable' | 'declining' | 'volatile';
  geographicPresence: GeographicPresence[];
  topRegions: string[];

  // Explainability
  breakdowns: {
    demand: ScoreBreakdown;
    salary: ScoreBreakdown;
    growth: ScoreBreakdown;
    scarcity: ScoreBreakdown;
    automationRisk: ScoreBreakdown;
    resilience: ScoreBreakdown;
    opportunity: ScoreBreakdown;
  };

  insights: string[];
  riskFlags: string[];
}
```

### Example Output

```
Software Engineer

Demand:              82/100
Salary:              80/100
Growth:              75/100
Scarcity:            55/100
Automation Risk:     40/100
Future Resilience:   78/100
───────────────────────────
Opportunity Score:   81/100
Confidence:          87/100

Outlook: GOOD
Trend: Improving
```

## Scoring Engines

### Demand Scoring Engine

**Responsibility:** Calculate labor market demand.

**Inputs:**
- Job postings
- Hiring velocity
- Employer demand
- Geographic demand

**Weights:**
- Job postings: 35%
- Hiring velocity: 25%
- Employer competition: 20%
- Geographic spread: 20%

**Output:** Demand Score (0-100)

### Salary Scoring Engine

**Responsibility:** Calculate economic attractiveness.

**Inputs:**
- Salary growth
- Median salary
- Regional salary variation
- Progression potential

**Weights:**
- Growth: 30%
- Absolute level: 35%
- Regional variation: 20%
- Progression: 15%

**Output:** Salary Score (0-100)

### Growth Scoring Engine

**Responsibility:** Measure career expansion.

**Inputs:**
- Hiring growth (1-year, 3-year)
- Industry growth
- Investment indicators
- Startup activity

**Weights:**
- Hiring growth: 35%
- Industry growth: 30%
- Investment: 20%
- Startup activity: 15%

**Output:** Growth Score (0-100)

### Scarcity Scoring Engine

**Responsibility:** Measure talent shortages.

**Inputs:**
- Talent availability
- Skill gap metrics
- Education pipeline
- Hiring difficulty

**Weights:**
- Availability: 30%
- Skill gap: 25%
- Pipeline: 20%
- Difficulty: 25%

**Output:** Scarcity Score (0-100)

### Automation Risk Engine

**Responsibility:** Estimate disruption risk.

**Inputs:**
- Routine task exposure
- AI substitution risk
- Cognitive task exposure
- Human immunity factors

**Weights:**
- Routine tasks: 35%
- AI substitution: 30%
- Cognitive tasks: 20%
- Human immunity: 15%

**Output:** Automation Risk Score (0-100)

Higher = Higher Risk

### Future Resilience Engine

**Responsibility:** Measure long-term survivability.

**Inputs:**
- Skill adaptability
- Industry resilience
- Human dependency
- AI resistance

**Weights:**
- Adaptability: 30%
- Industry resilience: 25%
- Human dependency: 25%
- AI resistance: 20%

**Output:** Future Resilience Score (0-100)

### Opportunity Scoring Engine

**Responsibility:** Generate overall opportunity assessment.

**Inputs:**
- Demand score
- Salary score
- Growth score
- Scarcity score
- Automation risk (inverted)
- Future resilience

**Weights:**
- Demand: 25%
- Salary: 20%
- Growth: 20%
- Scarcity: 10%
- Automation risk: 10%
- Resilience: 15%

**Output:** Opportunity Score (0-100)

**Additional:** Generates full OpportunityAnalysis with SWOT.

## Usage

### Basic Profile Generation

```typescript
import { createCareerMarketProfileEngine } from './profile';

const engine = createCareerMarketProfileEngine();

const result = engine.generateProfile({
  careerId: 'software-engineer',
  signals: rawSignals,
  normalizedSignals: normalizedSignals,
  aggregateSignals: aggregateSignals,
});

if (result.success) {
  console.log(result.profile.opportunityScore);
}
```

### Generate Opportunity Analysis

```typescript
const analysis = engine.generateOpportunityAnalysis(profile);

console.log(analysis.strengths);
console.log(analysis.risks);
console.log(analysis.recommendations);
```

### Compare Careers

```typescript
const comparison = engine.compareProfiles(profileA, profileB);

console.log(comparison.overallWinner);
console.log(comparison.scores);
```

### Get Score Breakdown

```typescript
const breakdown = engine.getScoreBreakdown(profile);

// Explain how demand was calculated
console.log(breakdown.demand.contributions);
console.log(breakdown.demand.adjustments);
```

## Score Interpretation

### Opportunity Score

| Range | Level | Interpretation |
|-------|-------|----------------|
| 80-100 | Excellent | Outstanding opportunity |
| 65-79 | Good | Strong opportunity |
| 45-64 | Neutral | Average opportunity |
| 30-44 | Caution | Below average |
| 0-29 | Poor | Weak opportunity |

### Automation Risk

| Range | Level | Interpretation |
|-------|-------|----------------|
| 0-24 | Low | Minimal automation risk |
| 25-49 | Moderate | Some automation exposure |
| 50-74 | High | Significant automation risk |
| 75-100 | Critical | High automation exposure |

### Future Resilience

| Range | Level | Interpretation |
|-------|-------|----------------|
| 85-100 | Antifragile | Thrives in change |
| 70-84 | Resilient | Survives disruption |
| 50-69 | Stable | Moderate adaptability |
| 30-49 | Vulnerable | Limited adaptability |
| 0-29 | Fragile | High fragility |

## Explainability

Every score includes:

1. **Contributions** - How each factor contributed
2. **Adjustments** - Bonuses/penalties applied
3. **Formula** - Calculation method used
4. **Evidence** - Signals that informed the score
5. **Confidence** - Reliability of the score

Example:
```
Demand Score: 82/100

Contributions:
  - Job Postings: 85/100 (weight: 35%) → contribution: 29.8
  - Hiring Velocity: 80/100 (weight: 25%) → contribution: 20.0
  - Competition: 75/100 (weight: 20%) → contribution: 15.0
  - Geographic Spread: 85/100 (weight: 20%) → contribution: 17.0

Adjustments:
  +5: High employer diversity (12 employers)

Confidence: 87%
Evidence: 15 signals from 4 sources
```

## Integration

### Data Flow

```
ProviderRegistry.fetchAll()
      ↓
SignalAdapter.normalize()
      ↓
CareerMarketProfileEngine.generateProfile()
      ↓
RecommendationEngine.recommend()
```

### For Recommendation Systems

```typescript
// Get profile for recommendation
const profile = await marketRepository.getProfile(careerId);

// Check if career is viable
if (profile.opportunityScore >= 60 && profile.confidence >= 50) {
  // Include in recommendations
}

// Check for risk flags
if (profile.riskFlags.includes('critical-automation-risk')) {
  // Add warning or filter out
}
```

## Configuration

### Engine Configuration

```typescript
const engine = createCareerMarketProfileEngine({
  minSignals: 5,              // Minimum signals required
  maxSignalAgeDays: 90,       // Maximum age of signals
  enableGeographicAnalysis: true,
  enableOpportunityAnalysis: true,
  minConfidenceThreshold: 40,
});
```

### Individual Engine Configuration

```typescript
const demandEngine = createDemandScoringEngine({
  jobPostingWeight: 0.4,      // Increase job posting weight
  hiringVelocityWeight: 0.2,
  competitionWeight: 0.2,
  geographicWeight: 0.2,
});
```

## Best Practices

1. **Always check success** - Profile generation can fail
2. **Validate confidence** - Low confidence profiles need more data
3. **Review breakdowns** - Understand how scores were calculated
4. **Monitor risk flags** - Critical flags need attention
5. **Track versions** - Compare profile versions over time
6. **Cache profiles** - Don't regenerate unnecessarily
7. **Batch operations** - Use generateProfiles() for multiple careers

## Performance

- Single profile generation: ~10-50ms
- Batch generation (100 careers): ~500ms-2s
- Memory usage: ~5KB per profile
- Recommended cache TTL: 24 hours

## Future Enhancements

Planned features:
- **Sentiment Scoring** - Social media and news sentiment
- **Skill Scoring** - Individual skill demand scores
- **Remote Work Scoring** - Remote/hybrid opportunity
- **Entry Barrier Scoring** - Difficulty to enter career
- **Career Transition Scoring** - Ease of switching to/from

## Important Rules

1. **No hardcoded scores** - All scores calculated from signals
2. **No manual rankings** - Deterministic algorithms only
3. **No market logic in recommendations** - Recommendation systems consume profiles
4. **Always explainable** - Every score has a breakdown
5. **Confidence matters** - Low confidence = less reliable
6. **Risk flags are warnings** - Not disqualifiers, but need attention
