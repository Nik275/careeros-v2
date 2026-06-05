# CareerOS Market Intelligence - Market Trend Layer

## Phase 1.4: Market Trend & Forecast Preparation Layer

**Purpose:** Temporal intelligence layer that tracks how careers, skills, industries, and regions evolve over time.

**Key Principle:** This layer prepares data for analysis. It does NOT forecast. It does NOT predict. It only understands change.

---

## Architecture Overview

```
MarketTrendEngine (Main Orchestrator)
├── TrendDetectionEngine
│   └── Detects trend direction and classification
├── MomentumEngine
│   └── Measures speed of change
├── AccelerationEngine
│   └── Measures change in momentum
├── TrendPersistenceEngine
│   └── Determines if trend is temporary or durable
├── CareerTrendEngine
│   └── Career-specific trend analysis
├── SkillTrendEngine
│   └── Skill-specific trend analysis
├── IndustryTrendEngine
│   └── Industry-specific trend analysis
└── RegionTrendEngine
    └── Region-specific trend analysis
```

---

## Core Engines

### 1. TrendDetectionEngine

**Purpose:** Detect trend direction and classification from historical data.

**Input:** Array of TrendSnapshot
**Output:** TrendClassification

**Thresholds:**
- Rapid Growth: >= +30% change
- Growth: +10% to +30% change
- Stable: -10% to +10% change
- Declining: -30% to -10% change
- Rapid Decline: <= -30% change
- Volatile: High variance (>25 CV)

**Example:**
```typescript
const detection = engine.detectTrend(snapshots);
// Returns: { classification: 'RAPID_GROWTH', strength: 85, ... }
```

### 2. MomentumEngine

**Purpose:** Measure speed of change.

**Input:** Array of TrendSnapshot
**Output:** MarketMomentum (0-100 score)

**Momentum Levels:**
- Explosive: 90-100
- High: 70-89
- Moderate: 40-69
- Low: 20-39
- Static: 0-19

**Example:**
```typescript
const momentum = engine.calculateMomentum(snapshots);
// Returns: { score: 75, level: 'high', direction: 'rising', ... }
```

### 3. AccelerationEngine

**Purpose:** Measure change in momentum.

**Input:** Array of TrendSnapshot
**Output:** Acceleration score (-100 to +100)

**Acceleration Levels:**
- Strong Acceleration: +60 to +100
- Acceleration: +20 to +59
- Stable: -19 to +19
- Deceleration: -59 to -20
- Strong Deceleration: -100 to -60

**Example:**
```typescript
const acceleration = engine.calculateAcceleration(snapshots);
// Returns: { score: +35, level: 'acceleration', ... }
```

### 4. TrendPersistenceEngine

**Purpose:** Determine if trend is temporary or durable.

**Input:** Array of TrendSnapshot
**Output:** Persistence score (0-100)

**Persistence Levels:**
- Structural: Score >= 80, Duration >= 6 months
- Durable: Score >= 60
- Medium-term: Score >= 40
- Short-term: Score >= 20
- Temporary: Score < 20

**Example:**
```typescript
const persistence = engine.calculatePersistence(snapshots);
// Returns: { score: 72, level: 'durable', likelyToContinue: true, ... }
```

---

## Domain-Specific Engines

### CareerTrendEngine

**Tracks:**
- Career demand trends
- Career salary trends
- Career growth trends
- Career opportunity trends

**Methods:**
- `analyzeCareer()` - Full career trend analysis
- `compareCareers()` - Compare two careers
- `rankCareers()` - Rank by trend strength
- `identifyRisingCareers()` - Find upward trends
- `identifyDecliningCareers()` - Find downward trends

### SkillTrendEngine

**Tracks:**
- Skill demand trends
- Skill scarcity trends
- Skill lifecycle stage
- Future relevance

**Methods:**
- `analyzeSkill()` - Full skill trend analysis
- `identifyEmergingSkills()` - Find new growing skills
- `identifyDecliningSkills()` - Find obsolete skills
- `rankByDemand()` - Rank skills by demand

### IndustryTrendEngine

**Tracks:**
- Industry expansion
- Hiring growth
- Investment activity
- Market confidence

**Methods:**
- `analyzeIndustry()` - Full industry trend analysis
- `rankIndustries()` - Rank by growth
- `identifyThrivingIndustries()` - Find high-growth sectors
- `identifyDistressedIndustries()` - Find contracting sectors

### RegionTrendEngine

**Tracks:**
- Regional demand
- Regional growth
- Remote opportunity growth
- Startup ecosystem growth

**Methods:**
- `analyzeRegion()` - Full region trend analysis
- `rankRegions()` - Rank by attractiveness
- `identifyAttractiveRegions()` - Find high-opportunity markets
- `identifyEmergingRegions()` - Find up-and-coming markets

---

## Data Models

### TrendSnapshot

```typescript
interface TrendSnapshot {
  id: string;                    // Unique identifier
  entityId: string;              // Entity being tracked
  entityType: string;            // 'career' | 'skill' | 'industry' | 'region'
  metricType: string;            // Type of metric
  timestamp: Date;               // When snapshot was taken
  value: number;                 // Metric value (0-100)
  dataPoints: number;            // Number of underlying data points
  sources: string[];             // Data sources
  confidence: number;            // Confidence in snapshot (0-100)
  frequency: string;             // 'daily' | 'weekly' | 'monthly'
}
```

### TrendAnalysis

```typescript
interface TrendAnalysis {
  entityId: string;
  entityType: string;
  metricType: string;
  classification: TrendClassification;
  momentum: number;              // 0-100
  acceleration: number;          // -100 to +100
  persistence: number;           // 0-100
  confidence: number;            // 0-100
  direction: 'up' | 'down' | 'flat';
  strength: number;              // 0-100
  rateOfChange: number;          // Percentage change
  volatility: number;            // 0-100
  dataPoints: number;
  periodDays: number;
  startValue: number;
  currentValue: number;
  peakValue: number;
  troughValue: number;
  analyzedAt: Date;
  explanation: string[];
  insights: string[];
  riskFlags: string[];
  evidence: Evidence[];
}
```

### TrendClassification

```typescript
enum TrendClassification {
  RAPID_GROWTH = 'RAPID_GROWTH',    // >= +30% change
  GROWTH = 'GROWTH',                 // +10% to +30%
  STABLE = 'STABLE',                 // -10% to +10%
  DECLINING = 'DECLINING',           // -30% to -10%
  RAPID_DECLINE = 'RAPID_DECLINE',   // <= -30%
  VOLATILE = 'VOLATILE',             // High variance
  EMERGING = 'EMERGING',             // Insufficient data
}
```

---

## Usage Examples

### Basic Trend Analysis

```typescript
import { MarketTrendEngine, createTrendSnapshot } from './trends';

// Initialize engine
const engine = new MarketTrendEngine();

// Add snapshots
engine.addSnapshot(createTrendSnapshot({
  entityId: 'software-engineer',
  entityType: 'career',
  metricType: 'demand',
  timestamp: new Date(),
  value: 78,
  sources: ['linkedin', 'indeed'],
}));

// Analyze trend
const analysis = engine.analyzeTrend('career', 'software-engineer');
console.log(analysis?.summary);
// "career software-engineer: rapid growth (85/100 strength) | +25% change | high momentum (75/100) | accelerating (+35) | durable persistence (72/100)"
```

### Compare Two Careers

```typescript
const comparison = engine.compareTrends(
  { type: 'career', id: 'software-engineer' },
  { type: 'career', id: 'data-scientist' }
);

if (comparison) {
  console.log(`Winner: ${comparison.comparison.winner}`);
  console.log(`Reason: ${comparison.comparison.reasoning}`);
}
```

### Get Market Summary

```typescript
const summary = engine.getMarketSummary();

console.log(`Total entities: ${summary.totalEntities}`);
console.log(`Growing: ${summary.distribution.growth + summary.distribution.rapidGrowth}`);
console.log(`Top rising:`, summary.topRising.slice(0, 5));
```

### Find Rising Careers

```typescript
const risingCareers = engine.getRisingCareers(70);
console.log('High-momentum careers:', risingCareers);
```

---

## Design Principles

### 1. No Hardcoded Data
- All trends derived from input snapshots
- No career-specific logic
- No prediction of future values

### 2. Explainable Results
- Every score has a calculation
- Explanations provided for all classifications
- Evidence attached to all analyses

### 3. Confidence-Weighted
- All scores weighted by data quality
- Confidence calculated from multiple factors
- Uncertainty explicitly tracked

### 4. Temporal Awareness
- Time-series analysis
- Period-based calculations
- History tracking and comparison

### 5. Multi-Domain
- Unified analysis across careers, skills, industries, regions
- Comparable metrics across domains
- Cross-domain insights

---

## Configuration

### MarketTrendEngineConfig

```typescript
interface MarketTrendEngineConfig {
  analysisPeriodDays: number;      // Default: 180
  minDataPoints: number;           // Default: 10
  enableCareerTrends: boolean;     // Default: true
  enableSkillTrends: boolean;      // Default: true
  enableIndustryTrends: boolean;   // Default: true
  enableRegionTrends: boolean;     // Default: true
}
```

### Individual Engine Configs

Each engine has its own configuration:
- `TrendDetectionConfig` - Thresholds for classification
- `MomentumConfig` - Window sizes and weights
- `AccelerationConfig` - Short/long term windows
- `PersistenceConfig` - Duration thresholds

---

## Key Outputs

### For Each Entity:
1. **Trend Classification** - Growth, decline, stable, volatile
2. **Momentum Score** - Speed of change (0-100)
3. **Acceleration Score** - Change in momentum (-100 to +100)
4. **Persistence Score** - Durability of trend (0-100)
5. **Confidence Score** - Reliability of analysis (0-100)

### For Market:
1. **Distribution** - How many entities in each classification
2. **Top Rising** - Entities with strongest upward momentum
3. **Top Declining** - Entities with strongest downward trends
4. **Market Momentum** - Overall market health by domain

---

## Integration with Other Layers

### Input From:
- **Data Source Layer** - MarketSignals as snapshot sources
- **Profile Engine** - CareerMarketProfile histories

### Output To:
- **Analysis Layer** - Trend data for career recommendations
- **User Interface** - Trend visualizations and alerts
- **Reporting** - Market reports and insights

---

## Files

```
src/intelligence/market/trends/
├── MarketTrendEngine.ts          # Main orchestrator
├── TrendDetectionEngine.ts       # Direction detection
├── MomentumEngine.ts             # Speed measurement
├── AccelerationEngine.ts         # Momentum change
├── TrendPersistenceEngine.ts     # Durability assessment
├── CareerTrendEngine.ts          # Career analysis
├── SkillTrendEngine.ts           # Skill analysis
├── IndustryTrendEngine.ts        # Industry analysis
├── RegionTrendEngine.ts          # Region analysis
├── index.ts                      # Exports
├── MARKET_TRENDS.md              # This documentation
└── models/
    ├── TrendSnapshot.ts          # Data point model
    ├── TrendAnalysis.ts          # Analysis result model
    ├── TrendClassification.ts    # Classification enum
    ├── MarketMomentum.ts         # Momentum model
    └── TrendHistory.ts           # History tracking
```

---

## Testing

The trend layer should be tested with:
1. Synthetic time-series data
2. Edge cases (insufficient data, volatile data)
3. Cross-domain comparisons
4. Configuration variations

---

## Future Enhancements

Potential additions (outside Phase 1.4 scope):
- Correlation analysis between careers/skills
- Seasonal trend detection
- Cross-regional comparison matrices
- Export/import of trend data
- Trend alerting system
