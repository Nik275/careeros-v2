# CareerOS Data Source Layer

## Overview

The Data Source Layer is the **single ingestion point** for all external market intelligence in CareerOS.

### Core Rule

> **No other module should directly consume external market data.**
> 
> Everything must become `MarketSignal` before entering the intelligence system.

## Architecture

```
External Sources
      ↓
[Provider] (NCS, Naukri, NASSCOM, etc.)
      ↓
RawMarketData
      ↓
[SignalAdapter]
      ↓
MarketSignal
      ↓
[ProviderRegistry]
      ↓
Market Intelligence Layer
```

## Directory Structure

```
providers/
├── Government/              # Indian government sources
│   ├── NCSProvider.ts      # National Career Service
│   ├── NSDCProvider.ts     # National Skill Development Corp
│   ├── AICTEProvider.ts    # Technical education
│   ├── UGCProvider.ts      # Higher education
│   └── MinistryLaborProvider.ts  # Labor statistics
│
├── JobMarket/              # Job board aggregators
│   ├── NaukriProvider.ts   # Largest Indian job portal
│   ├── FounditProvider.ts  # Monster India
│   ├── IndeedProvider.ts   # Global aggregator
│   └── LinkedInProvider.ts # Professional network
│
├── Industry/               # Industry associations
│   ├── NasscomProvider.ts  # IT industry data
│   └── StartupIndiaProvider.ts  # Startup ecosystem
│
├── Global/                 # International sources
│   ├── WEFProvider.ts      # World Economic Forum
│   └── ILOProvider.ts      # International Labour Org
│
├── adapters/
│   └── SignalAdapter.ts    # Standardization layer
│
├── reliability/
│   └── SourceReliabilityEngine.ts  # Reliability scoring
│
├── registry/
│   └── ProviderRegistry.ts # Provider management
│
├── types.ts                # Core type definitions
├── index.ts                # Public exports
└── docs/
    └── DATA_SOURCE_LAYER.md (this file)
```

## Standardization Pipeline

Every external data source follows this pipeline:

### 1. Provider
Each provider implements the `DataProvider` interface:
- Fetches data from external source
- Returns `RawMarketData`
- Extracts `ExtractedSignal` objects
- Tracks health and reliability

### 2. Signal Adapter
The `SignalAdapter` converts extracted signals into standardized `MarketSignal`:
- Validates signal data
- Maps career titles to internal IDs
- Calculates confidence scores
- Normalizes geography names
- Normalizes strength values

### 3. Provider Registry
The `ProviderRegistry` manages all providers:
- Provider registration/discovery
- Enable/disable providers
- Health monitoring
- Fetch coordination
- Source prioritization

## Data Source Catalog

### Government Sources (Reliability: 90-95)

| Source | Signals | Frequency | Coverage |
|--------|---------|-----------|----------|
| NCS India | hiring demand, occupation growth, location demand | Weekly | All India |
| NSDC | skill demand, vocational demand, certification demand | Monthly | All India |
| AICTE | engineering trends, enrollment trends | Yearly | All India |
| UGC | higher education trends | Yearly | All India |
| Ministry of Labour | labor force statistics, employment shifts | Quarterly | All India |

### Job Market Sources (Reliability: 75-82)

| Source | Signals | Frequency | Coverage |
|--------|---------|-----------|----------|
| Naukri | job postings, skills, salary, demand velocity | Daily | All India |
| Foundit | job postings, skills, salary, demand velocity | Daily | Metro focus |
| Indeed | job postings, skills, salary | Daily | All India |
| LinkedIn | job postings, skills, professional demand | Daily | White-collar |

### Industry Sources (Reliability: 85-88)

| Source | Signals | Frequency | Coverage |
|--------|---------|-----------|----------|
| NASSCOM | technology demand, AI demand, software trends | Quarterly | IT sector |
| Startup India | startup growth, emerging industries, funding | Monthly | Recognized startups |

### Global Sources (Reliability: 88-90)

| Source | Signals | Frequency | Coverage |
|--------|---------|-----------|----------|
| WEF | future skills, industry transformations | Yearly | Global |
| ILO | labor market changes, automation impact | Yearly | Global/India |

## Source Reliability Model

### Base Reliability Scores

| Category | Base Score |
|----------|-----------|
| Government | 95 |
| Industry | 88 |
| Job Market | 80 |
| Global | 85 |
| Academic | 82 |
| Unknown | 30 |

### Signal Type Adjustments

Source reliability may vary by signal type:

```typescript
// NCS example
{
  job_postings: 96,      // Very reliable for job data
  skill_demand: 92,      // Good for skills
  salary_growth: 88,     // Moderate (self-reported)
  government_push: 98,   // Excellent for policy
}
```

### Dynamic Reliability

The `SourceReliabilityEngine` adjusts scores based on:
- Success rate
- Latency
- Data freshness
- Consistency
- Consecutive failures

## Signal Types by Source

### job_postings
Sources: NCS, NSDC, Naukri, Foundit, Indeed, LinkedIn, NASSCOM

### skill_growth
Sources: NSDC, Naukri, Foundit, Indeed, LinkedIn, AICTE, UGC, NASSCOM, WEF

### salary_growth
Sources: NCS, Naukri, Foundit, Indeed, LinkedIn

### layoffs
Sources: Ministry of Labour, ILO

### government_push
Sources: NCS, NSDC, Ministry of Labour, Startup India

### startup_activity
Sources: Startup India, NASSCOM

### investment_flow
Sources: Startup India, NASSCOM

### automation_risk
Sources: WEF, ILO

## Using the Data Source Layer

### Registering Providers

```typescript
import { ProviderRegistry, SignalAdapter, SourceReliabilityEngine } from './providers';
import { createNCSProvider, createNaukriProvider } from './providers';

const reliabilityEngine = createSourceReliabilityEngine();
const signalAdapter = createSignalAdapter(reliabilityEngine);
const registry = createProviderRegistry(reliabilityEngine, signalAdapter);

// Register providers
registry.register(createNCSProvider({ credentials: { apiKey: 'xxx' } }));
registry.register(createNaukriProvider({ credentials: { apiKey: 'yyy' } }));
```

### Fetching Data

```typescript
// Fetch from all enabled providers
const results = await registry.fetchAll({
  careerIds: ['software-engineer', 'data-scientist'],
  signalTypes: ['job_postings', 'salary_growth'],
});

// Fetch from specific provider
const ncsResult = await registry.fetchFromProvider('ncs-india', {
  careerIds: ['software-engineer'],
});
```

### Querying Providers

```typescript
// Get by category
const governmentProviders = registry.queryProviders({ category: 'government' });

// Get by signal type
const jobPostingProviders = registry.getProvidersBySignalType('job_postings');

// Get by minimum reliability
const highReliability = registry.queryProviders({ minReliability: 85 });
```

### Health Monitoring

```typescript
// Check all providers
const healthResults = await registry.checkAllHealth();

// Get statistics
const stats = registry.getStatistics();
```

## Reliability Tracking

### Get Reliability Score

```typescript
const score = reliabilityEngine.getReliability('ncs-india');
// Returns: 95
```

### Update Based on Performance

```typescript
const metrics = {
  successRate: 98,
  averageLatencyMs: 1200,
  dataFreshnessHours: 24,
  consistencyScore: 95,
  consecutiveFailures: 0,
  totalFetches30d: 100,
};

const adjustedScore = reliabilityEngine.updateReliability('naukri', metrics);
```

### Get Reliability History

```typescript
const history = reliabilityEngine.getReliabilityHistory('naukri', 30);
```

## Signal Adaptation

The `SignalAdapter` is the only component that creates `MarketSignal` objects.

### Confidence Calculation

Signal confidence is calculated from:
- Source reliability (30%)
- Signal type reliability (25%)
- Validation confidence (20%)
- Career mapping confidence (15%)
- Data freshness (10%)

### Career Mapping

External career titles are mapped to internal CareerOS taxonomy:
```typescript
// External: "Sr. Software Development Engineer"
// Internal: "software-engineer"
// Confidence: 85
```

### Geography Normalization

External location names are normalized:
```typescript
// External: "Bangalore", "Bengaluru", "BLR"
// Internal: "karnataka"
```

## Provider Implementation Guide

To add a new provider:

1. Create provider file in appropriate category folder
2. Implement `DataProvider` interface
3. Define `DataSourceMetadata` with reliability scores
4. Implement `extractSignals()` method
5. Export provider factory function
6. Add to `DATA_SOURCE_CATALOG` in index.ts

Example:

```typescript
export const MY_PROVIDER_METADATA: DataSourceMetadata = {
  sourceId: 'my-provider',
  sourceName: 'My Provider',
  category: 'job_market',
  reliabilityScore: 80,
  updateFrequency: 'daily',
  geographicCoverage: 'india',
  signalTypes: ['job_postings'],
  // ... other metadata
};

export class MyProvider implements DataProvider {
  readonly metadata = MY_PROVIDER_METADATA;
  // ... implementation
}
```

## Best Practices

1. **Never reason from raw data** - Always adapt to MarketSignal first
2. **Track all fetches** - Use registry for fetch history
3. **Monitor health** - Regular health checks detect issues early
4. **Respect rate limits** - Each provider has specific limits
5. **Cache appropriately** - Use cacheConfig based on update frequency
6. **Handle errors gracefully** - Always return structured error responses
7. **Log everything** - All fetches, adaptations, and errors should be logged

## Future Integrations

Planned future providers:
- **Shine.com** - Additional job board
- **TimesJobs** - Job portal
- **CII** - Confederation of Indian Industry
- **FICCI** - Industry chamber
- **World Bank** - Labor statistics
- **OECD** - Employment data
- **Coursera/Udemy** - Skill demand from courses

## Important Notes

- **No API connections yet** - All providers have placeholder implementations
- **No scraping** - Architecture ready for API integration
- **No cron jobs** - Scheduling layer to be built separately
- **Deterministic** - All calculations are explainable and reproducible
- **Type-safe** - Full TypeScript with strict typing
