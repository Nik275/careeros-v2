# CareerOS Market Intelligence Architecture

## Overview

The Market Intelligence Foundation is a dedicated intelligence layer within CareerOS that continuously monitors labor market evolution and updates career intelligence automatically.

### Core Principles

1. **COMPLETE SEPARATION**: This module is completely separate from matching, recommendation, decision-making, and student modeling systems. Other modules consume market intelligence but never generate it.

2. **CONSUMPTION-ONLY INTERFACE**: The `MarketIntelligenceProvider` interface is designed solely for consumption by other modules.

3. **DETERMINISTIC**: All calculations follow explicit, explainable rules with no opaque ML models.

4. **CONFIDENCE PROPAGATION**: Every output includes mandatory confidence scores that propagate through the system.

5. **HISTORICAL PRESERVATION**: Immutable snapshots preserve market state at any point in time.

## Module Structure

```
src/intelligence/market/
├── models/                          # Data models (no methods, just types)
│   ├── MarketSignal.ts              # Raw and normalized signals
│   ├── MarketTrend.ts               # Trend analysis and projections
│   ├── CareerMarketProfile.ts       # Authoritative career profiles
│   ├── EmergingCareer.ts            # Emerging career detection
│   └── MarketSnapshot.ts            # Historical snapshots
│
├── repositories/                    # Data access abstractions
│   ├── MarketRepository.ts          # Signal and snapshot storage
│   └── CareerMarketRepository.ts    # Profile storage
│
├── interfaces/                      # Provider contracts
│   ├── MarketProvider.ts            # External data source interface
│   └── MarketIntelligenceProvider.ts # Consumer-facing interface
│
├── constants/                       # Centralized configuration
│   └── MarketWeights.ts             # All weights in one place
│
├── engines/                         # Core logic (pure functions)
│   ├── MarketSignalEngine.ts        # Signal processing
│   ├── MarketConfidenceEngine.ts    # Confidence calculations
│   ├── MarketTrendEngine.ts         # Trend analysis
│   ├── CareerMarketProfileEngine.ts # Profile generation
│   ├── EmergingCareerEngine.ts      # Emerging career detection
│   └── MarketIntelligenceEngine.ts  # Main orchestrator
│
├── index.ts                         # Public API exports
└── docs/
    └── MARKET_INTELLIGENCE_ARCHITECTURE.md (this file)
```

## Data Flow

```
External Sources
      ↓
[MarketProvider] (NCS, NSDC, job boards)
      ↓
Raw MarketSignal
      ↓
[MarketSignalEngine] → NormalizedMarketSignal
      ↓
[MarketRepository] (storage)
      ↓
[MarketTrendEngine] → MarketTrend
      ↓
[CareerMarketProfileEngine] → CareerMarketProfile
      ↓
[CareerMarketRepository] (storage)
      ↓
[MarketIntelligenceEngine] ← Main Orchestrator
      ↓
[MarketIntelligenceProvider] ← Consumption Interface
      ↓
Matching, Recommendation, Decision Engines
```

## Score Ranges

All scores use the **0-100 normalized scale**:

| Score Range | Interpretation |
|------------|----------------|
| 90-100 | Excellent/Optimal |
| 80-89 | Very Good |
| 70-79 | Good |
| 60-69 | Above Average |
| 50-59 | Average |
| 40-49 | Below Average |
| 30-39 | Poor |
| 20-29 | Very Poor |
| 0-19 | Critical |

## Confidence System

Confidence is **mandatory** on every output:

- **Signal Confidence**: Source reliability × Freshness × Signal quality
- **Trend Confidence**: Data points × Fit quality (R²) × Signal confidence
- **Profile Confidence**: Signal quality × Quantity × Source diversity × Freshness × Consistency

Confidence thresholds:
- 90+ Very High
- 75-89 High
- 60-74 Moderate
- 40-59 Low
- <40 Very Low

## Weight Configuration

All weights are centralized in `constants/MarketWeights.ts`:

### Profile Component Weights
```typescript
PROFILE_COMPONENT_WEIGHTS = {
  demandScore: 0.25,
  salaryScore: 0.20,
  growthScore: 0.20,
  scarcityScore: 0.15,
  futureResilienceScore: 0.20
}
```

### Source Reliability Weights
```typescript
SOURCE_RELIABILITY_WEIGHTS = {
  ncs_india: 0.95,      // Government
  nsdc: 0.95,           // Government
  nasscom: 0.90,        // Industry association
  linkedin: 0.82,       // Professional network
  naukri: 0.80,         // Job board
  news_media: 0.65      // Lower reliability
}
```

## Engines

### MarketSignalEngine
- Validates raw signals
- Normalizes strength to 0-100
- Removes outliers
- Aggregates by career and type
- Stores normalized and aggregate signals

### MarketConfidenceEngine
- Calculates confidence for all outputs
- Propagates confidence through the system
- Provides confidence requirements by use case
- Generates improvement recommendations

### MarketTrendEngine
- Analyzes trends from signal history
- Calculates direction, momentum, strength
- Generates projections
- Detects significant changes

### CareerMarketProfileEngine
- Generates authoritative career profiles
- Calculates all component scores
- Produces snapshots for history
- Updates profiles incrementally

### EmergingCareerEngine
- Detects new careers from signals
- Analyzes growth metrics
- Classifies emergence stage
- Tracks velocity

### MarketIntelligenceEngine (Main Orchestrator)
- Coordinates all sub-engines
- Implements MarketIntelligenceProvider interface
- Manages external providers
- Handles subscriptions
- Provides health monitoring

## Consumer Interface

Other modules consume market intelligence through `MarketIntelligenceProvider`:

```typescript
interface MarketIntelligenceProvider {
  getMarketProfile(careerId: string): Promise<CareerMarketProfile | null>;
  getMarketTrend(careerId: string): Promise<MarketTrend | null>;
  getTrendAnalysis(careerId: string): Promise<CareerTrendAnalysis | null>;
  getComparativeIntelligence(baseCareerId: string, comparisonIds: string[]): Promise<ComparativeMarketIntelligence>;
  getMarketOutlookSummary(): Promise<MarketOutlookSummary>;
  getEmergingCareers(options?: { minConfidence?: number }): Promise<EmergingCareer[]>;
  getConfidenceLevel(careerId: string): Promise<number>;
  subscribeToUpdates(careerId: string, callback: Function): () => void;
}
```

## Repository Interfaces

Implementations may use any storage technology (in-memory, file-system, database):

```typescript
interface MarketRepository {
  saveSignal(signal: MarketSignal): Promise<void>;
  getSignalsByCareer(careerId: string): Promise<MarketSignal[]>;
  saveSnapshot(snapshot: MarketSnapshot): Promise<void>;
  getLatestSnapshot(careerId: string): Promise<MarketSnapshot | null>;
  buildMarketHistory(careerId: string): Promise<MarketHistory>;
}

interface CareerMarketRepository {
  saveProfile(profile: CareerMarketProfile): Promise<void>;
  getProfileByCareerId(careerId: string): Promise<CareerMarketProfile | null>;
  getProfileHistory(careerId: string): Promise<CareerMarketProfileSnapshot[]>;
}
```

## External Provider Interface

Future integrations implement `MarketProvider`:

```typescript
interface MarketProvider {
  config: MarketProviderConfig;
  fetch(options?: FetchOptions): Promise<MarketProviderFetchResult>;
  transformToSignals(data: MarketProviderData[]): Promise<MarketSignal[]>;
  healthCheck(): Promise<HealthStatus>;
}
```

Planned providers:
- NCS India (National Career Service)
- NSDC (National Skill Development Corporation)
- NASSCOM (IT industry data)
- Naukri, Foundit, LinkedIn, Indeed (job boards)
- WEF, ILO (research reports)

## Immutability

All data models are immutable:
- Signals cannot be modified after creation
- Snapshots are append-only
- Profile updates create new versions
- History is never deleted

## Type Safety

All modules use strict TypeScript:
- No `any` types
- Explicit return types on all public methods
- Branded types for IDs (e.g., `MarketSignalId`)
- Exhaustive union type handling

## Future Enhancements

- Real-time signal streaming
- ML-based signal classification (optional enhancement)
- Geographic market segmentation
- Industry-specific providers
- Predictive analytics
- Market simulation capabilities
