# CareerOS Market Intelligence - Market Discovery Layer

## Phase 1.5: Emerging Career & Skill Discovery Engine

**Purpose:** Continuously identify new opportunities and declining areas in the labor market.

**Key Principle:** This system DISCOVERS. It does NOT automatically publish. All discoveries enter a review pipeline. Human review required.

---

## Architecture Overview

```
DiscoveryEngine (Main Orchestrator)
├── CareerDiscoveryEngine
│   └── EmergingCareerEngine
├── SkillDiscoveryEngine
│   └── EmergingSkillEngine
├── IndustryDiscoveryEngine
│   └── EmergingIndustryEngine
├── DecliningCareerEngine
└── DecliningSkillEngine
```

---

## Core Concepts

### Discovery Signal

The atomic unit of discovery - an indication that something new or changing exists in the market.

```typescript
interface DiscoverySignal {
  source: string;              // Where signal came from
  sourceQuality: 'high' | 'medium' | 'low';
  signalType: 'new_job_title' | 'skill_growth' | 'industry_growth' |
              'funding_activity' | 'government_policy' | 'education_adoption' |
              'technology_shift' | 'market_convergence' | 'automation_trigger';
  strength: number;            // 0-100
  confidence: number;          // 0-100
  targetEntity: {
    type: 'career' | 'skill' | 'industry';
    name: string;
  };
  context: {
    description: string;
    relatedEntities: string[];
    geographicScope?: string;
    industryScope?: string[];
  };
  timestamp: Date;
  evidence: Evidence[];
}
```

### Confidence Calculation

Every discovery requires confidence. Factors:

1. **Source Count** (15%) - More sources = higher confidence
2. **Source Quality** (25%) - High-quality sources weighted more
3. **Signal Consistency** (25%) - Consistent direction across signals
4. **Trend Persistence** (20%) - Sustained over time
5. **Evidence Diversity** (15%) - Multiple evidence types

---

## Discovery Engines

### 1. Career Discovery Engine

**Purpose:** Identify occupations not currently represented in CareerOS.

**Examples:**
- AI Agent Engineer
- Climate Risk Analyst
- Synthetic Media Producer
- Digital Twin Architect
- Autonomous Systems Supervisor

**Process:**
1. Ingest signals with `targetEntity.type === 'career'`
2. Group by career name
3. Calculate confidence
4. Create `EmergingCareer` record
5. Add to review queue

**Output:**
```typescript
interface EmergingCareer {
  title: string;
  stage: 'unverified' | 'emerging' | 'growing' | 'establishing' | 'established';
  confidence: number;
  growthSignal: number;
  demandSignal: number;
  momentum: number;
  evidenceSources: EvidenceSource[];
  relatedSkills: string[];
  relatedIndustries: string[];
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
}
```

### 2. Skill Discovery Engine

**Purpose:** Identify skills not currently represented in Skill Taxonomy.

**Examples:**
- Agent Orchestration
- LLMOps
- AI Governance
- Synthetic Data Engineering
- Prompt Evaluation
- AI Safety Operations

**Process:**
1. Ingest signals with `targetEntity.type === 'skill'`
2. Group by skill name
3. Calculate adoption metrics
4. Create `EmergingSkill` record
5. Add to review queue

**Output:**
```typescript
interface EmergingSkill {
  name: string;
  category: 'technical' | 'ai_ml' | 'data' | 'soft' | ...;
  stage: 'experimental' | 'early_adoption' | 'early_majority' | 'late_majority' | 'ubiquitous';
  confidence: number;
  growthSignal: number;
  adoptionSignal: number;
  learningCurve: 'steep' | 'moderate' | 'gentle' | 'unknown';
  prerequisites: string[];
  tools: string[];
}
```

### 3. Industry Discovery Engine

**Purpose:** Identify emerging sectors.

**Examples:**
- Agent Economy
- Climate Tech
- Defense Tech
- Synthetic Biology
- Space Infrastructure
- Industrial AI

**Output:**
```typescript
interface EmergingIndustry {
  name: string;
  category: 'technology' | 'sustainability' | 'healthcare' | ...;
  stage: 'frontier' | 'emerging' | 'growth' | 'consolidation' | 'mature';
  confidence: number;
  growthSignal: number;
  investmentSignal: number;
  regulatoryEnvironment: 'supportive' | 'neutral' | 'uncertain' | 'restrictive';
  keyPlayers: string[];
}
```

### 4. Declining Career Engine

**Purpose:** Identify careers experiencing structural decline.

**Examples:**
- Manual Data Entry
- Traditional Print Journalism
- Toll Booth Operator
- Film Developer

**Decline Drivers:**
- Automation
- AI Replacement
- Outsourcing
- Technology Obsolescence
- Market Contraction

**Output:**
```typescript
interface DecliningCareer {
  title: string;
  stage: 'early_decline' | 'accelerating' | 'steady_decline' | 'terminal' | 'obsolete';
  confidence: number;
  declineSeverity: number;
  declineRate: number;
  drivers: DeclineDriver[];
  transferableSkills: string[];
  alternativePaths: string[];
  timelineEstimate?: number;  // Years until obsolete
}
```

### 5. Declining Skill Engine

**Purpose:** Identify skills losing relevance.

**Examples:**
- Legacy programming languages (in new contexts)
- Manual data entry techniques
- Traditional typesetting
- Fax machine operation

**Output:**
```typescript
interface DecliningSkill {
  name: string;
  stage: 'reducing_demand' | 'declining' | 'legacy' | 'obsolete';
  confidence: number;
  obsolescenceSeverity: number;
  drivers: ObsolescenceDriver[];
  replacingSkills: string[];
  migrationDifficulty: number;
}
```

---

## Review Pipeline

All discoveries enter a review queue before integration:

```typescript
interface DiscoveryQueueEntry {
  id: string;
  entityType: 'career' | 'skill' | 'industry';
  entityName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  confidence: number;
  signalCount: number;
  submittedAt: Date;
  reviewer?: string;
  reviewNotes?: string;
}
```

### Review Process

1. **Detection** → Signal processing creates discovery
2. **Queue Entry** → Added to pending review
3. **Assignment** → Reviewer assigned
4. **Evaluation** → Human review of evidence
5. **Decision** → Approved or rejected
6. **Integration** → Approved discoveries fed to knowledge graph

---

## Usage Examples

### Basic Discovery

```typescript
import { DiscoveryEngine, createDiscoverySignal } from './discovery';

// Initialize engine
const engine = new DiscoveryEngine();

// Add discovery signal
engine.addSignal(createDiscoverySignal({
  source: 'LinkedIn',
  sourceQuality: 'high',
  signalType: 'new_job_title',
  strength: 75,
  confidence: 80,
  targetEntity: {
    type: 'career',
    name: 'AI Agent Engineer',
  },
  context: {
    description: 'New role focused on building autonomous AI agents',
    relatedEntities: ['LLM', 'Python', 'System Design'],
    geographicScope: 'Global',
  },
  evidence: [{ type: 'job_posting', value: '500+ postings' }],
}));

// Process and discover
const result = engine.discover([signal]);

console.log(`Found ${result.summary.careerDiscoveries} new careers`);
console.log(`Found ${result.summary.skillDiscoveries} new skills`);
```

### Accessing Discoveries

```typescript
// Get all discoveries
const all = engine.getAllDiscoveries();

// Get pending review
const pending = engine.getPendingReview();

// Get top opportunities
const top = engine.getTopOpportunities(10);

// Get decline alerts
const alerts = engine.getDeclineAlerts(70);
```

### Review Workflow

```typescript
// Approve a discovery
engine.approveDiscovery('career', 'career-id-123', 'Verified with multiple sources');

// Reject a discovery
engine.rejectDiscovery('skill', 'skill-id-456', 'False positive - not a distinct skill');

// Get statistics
const stats = engine.getStatistics();
console.log(`Total careers discovered: ${stats.totals.careers}`);
console.log(`Pending review: ${stats.pendingReview.careers}`);
```

---

## Design Principles

### 1. Evidence-Driven
- All discoveries based on signals
- Confidence calculated from evidence quality
- No predictions or speculation

### 2. Human Review Required
- No automatic integration
- All discoveries enter review queue
- Reviewer approval required

### 3. Explainable
- Clear reasoning for discoveries
- Confidence factor breakdown
- Evidence trail maintained

### 4. Non-Destructive
- Never modifies existing knowledge graph
- Proposes additions only
- Safe to run continuously

### 5. Configurable Thresholds
- Adjustable confidence thresholds
- Configurable auto-promotion rules
- Review queue enabled/disabled per type

---

## Configuration

### DiscoveryEngineConfig

```typescript
interface DiscoveryEngineConfig {
  enableCareerDiscovery: boolean;
  enableSkillDiscovery: boolean;
  enableIndustryDiscovery: boolean;
  enableDecliningCareerDetection: boolean;
  enableDecliningSkillDetection: boolean;
  autoProcess: boolean;
  minConfidence: number;
}
```

### Individual Engine Configs

Each engine has its own configuration:
- `EmergingCareerConfig` - Signal thresholds, confidence requirements
- `EmergingSkillConfig` - Adoption metrics, stage thresholds
- `EmergingIndustryConfig` - Investment signals, maturity indicators
- `DecliningCareerConfig` - Decline thresholds, urgency calculations
- `DecliningSkillConfig` - Obsolescence detection

---

## Files

```
src/intelligence/market/discovery/
├── DiscoveryEngine.ts                # Main orchestrator
├── DiscoveryConfidenceEngine.ts      # Confidence calculation
├── CareerDiscoveryEngine.ts          # Career discovery main
├── EmergingCareerEngine.ts           # Career detection
├── SkillDiscoveryEngine.ts           # Skill discovery main
├── EmergingSkillEngine.ts            # Skill detection
├── IndustryDiscoveryEngine.ts        # Industry discovery main
├── EmergingIndustryEngine.ts         # Industry detection
├── DecliningCareerEngine.ts          # Declining career detection
├── DecliningSkillEngine.ts           # Declining skill detection
├── index.ts                          # Exports
├── MARKET_DISCOVERY.md               # This documentation
└── models/
    ├── DiscoverySignal.ts            # Signal model
    ├── EmergingCareer.ts             # Career model
    ├── EmergingSkill.ts              # Skill model
    ├── EmergingIndustry.ts           # Industry model
    ├── DecliningCareer.ts            # Declining career model
    └── DiscoveryAnalysis.ts          # Analysis result model
```

---

## Integration

### Outputs Feed To:
- Career Knowledge Graph (after approval)
- Skill Taxonomy (after approval)
- Market Intelligence System
- Career Expansion Engine

### Does NOT:
- Automatically modify knowledge graphs
- Make career recommendations directly
- Predict future trends
- Execute without human oversight

---

## Example Discoveries

### Emerging Career: AI Agent Engineer

```typescript
{
  title: 'AI Agent Engineer',
  stage: 'emerging',
  confidence: 87,
  growthSignal: 92,
  demandSignal: 78,
  relatedSkills: ['LLM', 'Python', 'System Design', 'Prompt Engineering'],
  relatedIndustries: ['AI/ML', 'Enterprise Software'],
  evidenceSources: [
    { type: 'job_posting', source: 'LinkedIn', strength: 85 },
    { type: 'industry_report', source: 'Gartner', strength: 90 },
  ],
  reviewStatus: 'pending'
}
```

### Declining Skill: Manual Data Entry

```typescript
{
  name: 'Manual Data Entry',
  stage: 'declining',
  confidence: 84,
  obsolescenceSeverity: 78,
  drivers: ['automation', 'technology_replacement'],
  replacingSkills: ['Data Automation', 'RPA', 'Data Integration'],
  migrationDifficulty: 45,
  timeToObsolescence: 3 // years
}
```

---

## Testing

The discovery layer should be tested with:
1. Synthetic discovery signals
2. Edge cases (low confidence, conflicting signals)
3. Review workflow scenarios
4. Integration boundary tests

---

## Future Enhancements

Potential additions (outside Phase 1.5 scope):
- Correlation analysis (emerging skill → emerging career)
- Automated evidence scraping
- Machine learning for signal classification
- Discovery alerting system
- Cross-market comparison
