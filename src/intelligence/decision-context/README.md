# Decision Context Engine

A comprehensive intelligence system for detecting and analyzing a student's current decision context within CareerOS.

## Overview

The Decision Context Engine identifies the situational factors that influence a student's career decisions. Unlike behavioral archetypes (which are stable personality patterns), contexts represent temporary life situations that shape decision-making priorities.

### Key Principle: Context ≠ Archetype

- **Context** = Current life situation (situational, temporary, external)
- **Archetype** = Behavioral pattern (personality-based, stable, internal)

**Example**: A student can be a **Builder** (archetype) who is preparing for **UPSC** (context), or a **Researcher** (archetype) exploring **startups** (context).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Decision Context Engine                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ Signal          │    │ Context         │    │ Context     │ │
│  │ Extraction      │───▶│ Scoring         │───▶│ Explanation │ │
│  │                 │    │                 │    │             │ │
│  │ • Assessment    │    │ • Confidence    │    │ • Narrative │ │
│  │ • Profile       │    │   calculation   │    │ • Character │ │
│  │ • Goals         │    │ • Prioritization│    │ • Conflict  │ │
│  │ • User Input    │    │ • Conflict      │    │   explain   │ │
│  │                 │    │   detection     │    │             │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                      │                      │       │
│           ▼                      ▼                      ▼       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ContextAnalysis Output                       │  │
│  │  • Primary/Secondary contexts                             │  │
│  │  • Confidence scores + uncertainty                       │  │
│  │  • Human-readable explanations                           │  │
│  │  • Conflict detection                                    │  │
│  │  • Recommendations                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Supported Context Types

### Entrance Examinations

| Context | Description | Key Signals |
|---------|-------------|-------------|
| `JEE_PREPARATION` | Engineering entrance focus | JEE, IIT, NIT, PCM subjects, Class 11-12 |
| `NEET_PREPARATION` | Medical entrance focus | NEET, MBBS, Biology, Medical colleges |
| `UPSC_PREPARATION` | Civil services | UPSC, IAS, IPS, Civil services, Post-grad |
| `STATE_PSC_PREPARATION` | State administrative | MPSC, BPSC, State-specific exams |

### Professional Qualifications

| Context | Description | Key Signals |
|---------|-------------|-------------|
| `CA_PATHWAY` | Chartered Accountancy | CA, ICAI, Foundation, Articleship |
| `CS_PATHWAY` | Company Secretary | CS, ICSI, Corporate law, Compliance |
| `CMA_PATHWAY` | Cost & Management Accounting | CMA, ICMAI, Cost accounting |

### Education Selection

| Context | Description | Key Signals |
|---------|-------------|-------------|
| `COLLEGE_SELECTION` | Choosing institutions | College comparison, Admissions, Rankings |
| `SCHOOL_SELECTION` | School/board choice | School admissions, CBSE vs ICSE |
| `COURSE_SELECTION` | Major/specialization | Branch selection, B.Tech vs B.Sc |

### Career Phases

| Context | Description | Key Signals |
|---------|-------------|-------------|
| `CAREER_EXPLORATION` | Exploring options | "What should I do?", Too many options |
| `EARLY_CAREER` | 0-3 years exp | First job, Fresh graduate, Entry level |
| `MID_CAREER` | 5+ years exp | Experienced, Senior, Leadership track |

### Career Transitions

| Context | Description | Key Signals |
|---------|-------------|-------------|
| `CAREER_SWITCH` | Changing paths | Career change, New field, Pivot |
| `INDUSTRY_TRANSITION` | Industry move | IT to finance, Industry switch |

### Entrepreneurial

| Context | Description | Key Signals |
|---------|-------------|-------------|
| `STARTUP_EXPLORATION` | Exploring entrepreneurship | Startup idea, Business idea, Founder |
| `ENTREPRENEURSHIP_BUILDING` | Building venture | Building startup, My company, Revenue |

### Family & Constraints

| Context | Description | Key Signals |
|---------|-------------|-------------|
| `FAMILY_BUSINESS` | Family enterprise | Family business, Joining business, Legacy |
| `REGIONAL_CONSTRAINT` | Geographic limits | Can't leave, Hometown only, Regional college |
| `FINANCIAL_CONSTRAINT` | Budget-driven | Can't afford, Scholarship needed, ROI |
| `TIME_CONSTRAINT` | Limited availability | No time, Part-time, Working full-time |

## Usage

### Basic Usage

```typescript
import { 
  createDecisionContextEngine,
  DecisionContextType 
} from '@/intelligence/decision-context';

const engine = createDecisionContextEngine();

const analysis = engine.analyze({
  profile: studentProfile,
  assessmentResponses: responses,
  explicitGoals: ['Crack JEE Advanced', 'Join IIT Bombay'],
  userInput: 'I am preparing for JEE and also interested in entrepreneurship',
  timestamp: Date.now(),
});

console.log(analysis.primaryContext?.context); // JEE_PREPARATION
console.log(analysis.secondaryContexts[0]?.context); // STARTUP_EXPLORATION
console.log(analysis.narrative.summary);
// "You are primarily in a JEE Preparation context, with Startup Exploration as a secondary consideration."
```

### Detecting Specific Contexts

```typescript
const jeeContext = engine.detectContext(
  DecisionContextType.JEE_PREPARATION,
  input
);

if (jeeContext) {
  console.log(jeeContext.confidence); // 0.85
  console.log(jeeContext.explanation); // Human-readable explanation
}
```

### Configuration Options

```typescript
const engine = createDecisionContextEngine({
  // Minimum confidence to report a context
  minConfidenceThreshold: 0.3,
  
  // Weights for different evidence types
  evidenceWeights: {
    EXPLICIT_ANSWER: 1.0,
    USER_DECLARED: 0.95,
    EDUCATION_DATA: 0.85,
    // ... etc
  },
  
  // Enable only specific contexts
  enabledContexts: [
    DecisionContextType.JEE_PREPARATION,
    DecisionContextType.NEET_PREPARATION,
    DecisionContextType.CAREER_EXPLORATION,
  ],
  
  // Explanation verbosity
  explanationVerbosity: 'detailed',
  
  // Maximum contexts to return
  maxContexts: 5,
});
```

### Quick vs Precise Detection

```typescript
// Quick detection - lower thresholds, faster results
const quickEngine = createQuickContextEngine();

// Precise detection - higher thresholds, more thorough
const preciseEngine = createPreciseContextEngine();
```

## Confidence & Scoring System

### Evidence Weights

Different evidence types carry different weights:

| Evidence Type | Weight | Description |
|---------------|--------|-------------|
| EXPLICIT_ANSWER | 1.0 | Direct answer in assessment |
| USER_DECLARED | 0.95 | User explicitly stated goal |
| EDUCATION_DATA | 0.85 | Profile education information |
| EXPERIENCE_DATA | 0.80 | Work experience indicators |
| GOAL_STATEMENT | 0.85 | Explicit goal declarations |
| IMPLICIT_SIGNAL | 0.60 | Inferred from behavior/patterns |
| PATTERN_MATCH | 0.50 | Keyword/pattern matching |
| TEMPORAL_INFERENCE | 0.45 | Time-based inference |

### Confidence Calculation

Confidence is calculated using weighted evidence combination with diminishing returns:

```
combined_score = Σ(evidence_strength × evidence_weight × diminishing_factor^n)
confidence = combined_score / (1 + combined_score × 0.5)
```

- Strong early evidence → significant confidence boost
- Additional evidence → diminishing returns
- Multiple strong evidence → small multi-evidence boost
- Capped at 0.95 (never 100% certain)

### Uncertainty Tracking

Every context detection includes uncertainty analysis:

```typescript
interface ContextUncertainty {
  score: number;              // 0-1, higher = more uncertain
  sources: UncertaintySource[]; // Why uncertain
  explanation: string;        // Human-readable
  potentialImprovement: number; // How much confidence could improve
  dataNeeds: string[];        // What data would help
}
```

## Context Conflicts

The engine detects conflicts between contexts:

### Conflict Types

1. **Mutually Exclusive**: Cannot coexist (e.g., JEE + NEET as primary)
2. **Resource Competition**: Compete for time/energy (e.g., UPSC + Full-time job)
3. **Priority Dispute**: Similar confidence levels (unclear primary)
4. **Temporal Conflict**: Incompatible timing requirements

### Conflict Detection

```typescript
if (analysis.conflicts.length > 0) {
  for (const conflict of analysis.conflicts) {
    console.log(conflict.description);
    console.log(conflict.resolution);
  }
}
```

## Explanation System

### Generated Outputs

Every analysis includes:

1. **Narrative Summary**: One-sentence overview
2. **Detailed Narrative**: Full context descriptions
3. **Key Insight**: Strategic observation
4. **Implications**: What this means for decisions
5. **Context Interaction**: How contexts relate

### Example Output

```typescript
{
  narrative: {
    summary: "You are primarily in a JEE Preparation context, with Startup Exploration as a secondary consideration.",
    detailed: "You are currently in a JEE Preparation context... Additionally: You are also exploring startups...",
    insight: "You have a primary focus with secondary interests. This multi-context approach can provide valuable optionality.",
    implications: "Your decisions should prioritize exam performance and admission outcomes...",
    contextInteraction: "Startup Exploration complements your primary context and may provide valuable optionality."
  }
}
```

## Extensibility

### Adding New Context Types

1. Add to `DecisionContextType` enum in `types.ts`
2. Add category mapping in `CONTEXT_TYPE_CATEGORIES`
3. Create signal extractor in `detection/signalExtractors.ts`
4. Add explanation template in `explanation/ContextExplanationEngine.ts`
5. Add characteristics in `CONTEXT_CHARACTERISTICS`
6. Register in `CONTEXT_EXTRACTORS`

### Adding Custom Signal Extractors

```typescript
const customExtractor: SignalExtractor = (input) => {
  const evidence: ContextEvidence[] = [];
  
  // Custom detection logic
  if (input.profile.someCustomField) {
    evidence.push({
      id: generateEvidenceId('CUSTOM', 'source'),
      type: EvidenceType.IMPLICIT_SIGNAL,
      strength: 0.8,
      description: 'Custom signal detected',
      source: 'custom_source',
      rawValue: input.profile.someCustomField,
      timestamp: Date.now(),
    });
  }
  
  return evidence;
};

engine.addSignalExtractor(customExtractor);
```

## Integration with CareerOS

### Assessment Flow

```
Student completes assessment
         ↓
AssessmentEngine processes responses
         ↓
DecisionContextEngine.analyze({
  profile: derivedProfile,
  assessmentResponses: responses,
  explicitGoals: extractedGoals
})
         ↓
Context stored in MentorMemoryCore
         ↓
Career recommendations adapted to context
```

### Profile Updates

When profile data changes:

```typescript
// Re-run context detection with new data
const newAnalysis = engine.analyze({
  profile: updatedProfile,
  previousAnalysis: oldAnalysis, // For delta detection
  timestamp: Date.now(),
});

// Detect context changes
if (newAnalysis.primaryContext?.context !== 
    oldAnalysis.primaryContext?.context) {
  // Context has shifted - update recommendations
}
```

## Testing

```typescript
import { createDecisionContextEngine } from './DecisionContextOrchestrator';

describe('DecisionContextEngine', () => {
  const engine = createDecisionContextEngine();
  
  it('detects JEE preparation context', () => {
    const analysis = engine.analyze({
      profile: mockJeeStudentProfile,
      explicitGoals: ['Clear JEE Advanced'],
      timestamp: Date.now(),
    });
    
    expect(analysis.primaryContext?.context)
      .toBe(DecisionContextType.JEE_PREPARATION);
    expect(analysis.primaryContext?.confidence).toBeGreaterThan(0.7);
  });
});
```

## Performance Considerations

- Signal extraction runs in parallel for all contexts
- Scoring is O(n) where n = number of evidence pieces
- No external API calls - all processing is local
- Typical analysis completes in < 10ms

## Future Extensibility

The architecture supports adding new contexts without breaking changes:

- **MBA Context**: MBA preparation, B-school selection
- **International Education**: Study abroad, foreign universities
- **Government Job**: SSC, Banking, PSU jobs
- **Medical Specialization**: PG medical, NEET PG
- **Research Career**: PhD, Research positions
- **Gig Economy**: Freelancing, Consulting

Simply add new enum values, extractors, and templates.

## Related Modules

- **Archetype Engine**: Detects behavioral patterns (separate from context)
- **Career Fit Engine**: Matches students to careers (uses context)
- **Recommendation Engine**: Generates recommendations (adapts to context)
- **Mentor Memory**: Stores context history over time
