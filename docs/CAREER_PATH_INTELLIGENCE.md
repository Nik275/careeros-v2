# Career Path Intelligence Engine

## Overview

The Career Path Intelligence Engine is a comprehensive system for modeling career pathways, designed specifically for the Indian education and career landscape. Unlike traditional recommendation engines, this is a **pathway intelligence engine** that understands the complexity of career journeys including alternative routes, failure recovery, and optionality.

## Core Philosophy

> **Students do not choose careers. Students choose pathways.**

This engine models:
- **Pathways** - Multiple routes to the same career destination
- **Milestones** - Achievable stages with clear objectives and validation
- **Transitions** - Points where students can pivot between paths
- **Alternatives** - Plan B, C, D for every primary path
- **Failure Recovery** - What happens when milestones fail

## Architecture

```
CareerPathIntelligenceEngine (Main Orchestrator)
│
├── PathDiscoveryEngine
│   └── Generates multiple pathways (direct, indirect, non-traditional)
│
├── PathValidationEngine
│   └── Validates feasibility, constraints, prerequisites
│
├── MilestoneEngine
│   └── Manages milestones, critical paths, parallel tracks
│
├── AlternativePathEngine
│   └── Generates Plan B, C, D with switching points
│
├── FailureRecoveryEngine
│   └── Models recovery options (RETRY, PIVOT, BRANCH, BYPASS, PARALLEL)
│
├── PathComparisonEngine
│   └── Compares paths across 6 dimensions
│
└── PathExplanationEngine
    └── Generates human-readable narratives
```

## Path Types

| Type | Description | Example |
|------|-------------|---------|
| `DIRECT` | Traditional, straightforward route | IIT → Software Engineer |
| `INDIRECT` | Alternative route to same destination | Tier 2 College → Analyst → PM |
| `NON_TRADITIONAL` | Unconventional approach | Startup → Product Ops → PM |
| `ENTREPRENEURIAL` | Starting own business | Self-taught → Founder |
| `ACADEMIC` | Research/education-focused | PhD → Research Scientist |
| `CORPORATE` | Company-employment focused | Campus placement → Corporate ladder |
| `GOVERNMENT` | Public sector path | UPSC → IAS |

## Core Models

### CareerPath

```typescript
interface CareerPath {
  pathId: string;
  name: string;
  type: PathType;
  targetCareer: string;
  
  // Characteristics
  difficulty: PathDifficulty;  // VERY_EASY to EXTREME
  riskLevel: PathRisk;         // VERY_LOW to VERY_HIGH
  duration: number;            // In months
  confidence: number;          // 0-1
  
  // Financials
  totalCost: number;
  opportunityCost: number;
  expectedStartingSalary: number;
  expectedSalaryAt5Years: number;
  roi: number;
  
  // Milestones
  milestones: Milestone[];
  
  // Relationships
  alternativePathIds: string[];
  recoveryPathIds: string[];
  
  // Optionality
  optionalityScore: number;
  optionalityBreakdown: {
    SKILL_TRANSFERABILITY: number;
    NETWORK_BREADTH: number;
    CREDENTIAL_VERSATILITY: number;
    INDUSTRY_MOBILITY: number;
    ROLE_FLEXIBILITY: number;
    GEOGRAPHIC_MOBILITY: number;
  };
}
```

### Milestone

```typescript
interface Milestone {
  id: string;
  name: string;
  description: string;
  order: number;
  
  // Timeline
  expectedDuration: number;
  minDuration: number;
  maxDuration: number;
  
  // Requirements
  prerequisites: Prerequisite[];
  resources: ResourceRequirement[];
  
  // Outcomes
  expectedOutcomes: ExpectedOutcome[];
  skillsAcquired: string[];
  credentialsEarned: string[];
  
  // Validation
  validationCriteria: ValidationCriterion[];
  successMetrics: SuccessMetric[];
  
  // Failure handling
  failureProbability: number;
  recoveryPaths: RecoveryPath[];
  
  status: MilestoneStatus;
}
```

## Recovery Strategies

When milestones fail, the engine provides multiple recovery options:

| Strategy | Description | Example |
|----------|-------------|---------|
| `RETRY` | Attempt same milestone again | Retake JEE |
| `PIVOT` | Switch to different path | Failed JEE → State Engineering |
| `BRANCH` | Take side path and return | Certification while retrying |
| `BYPASS` | Skip milestone if possible | Use alternative credential |
| `ABANDON` | Give up on current path | Choose different career |
| `PARALLEL` | Work on multiple options simultaneously | Prepare for JEE + State CET |

## India-Specific Support

### Competitive Exams

- **JEE** - Engineering (IIT, NIT, State Colleges)
- **NEET** - Medical (MBBS, BDS, Alternative Medicine)
- **UPSC** - Civil Services (IAS, IPS, IFS, IRS)
- **CA/CS/CMA** - Professional Courses
- **Banking/SSC** - Government Jobs

### Pathway Examples

#### Target: Product Manager

**Path A (Engineering Route):**
```
JEE → IIT → B.Tech → Software Engineer → Senior Engineer → Associate PM → Product Manager
Duration: 8-10 years | Cost: ₹15-25L | Risk: High
```

**Path B (Business Route):**
```
Tier 2 College → BBA → Business Analyst → Associate PM → Product Manager
Duration: 6-7 years | Cost: ₹8-15L | Risk: Moderate
```

**Path C (Startup Route):**
```
Any Degree → Startup Early Employee → Product Ops → Product Manager
Duration: 4-6 years | Cost: ₹2-5L | Risk: Very High
```

#### Target: Civil Servant (IAS)

**Path A (Direct UPSC):**
```
Graduation → UPSC Preparation (1-2 years) → Prelims → Mains → Interview → LBSNAA Training
Duration: 2-6 years | Cost: ₹2-5L | Risk: Very High (0.1% selection)
```

**Recovery if UPSC fails:**
- State PSC (similar preparation, easier selection)
- Banking PO (40% overlap in preparation)
- SSC CGL (70% overlap in preparation)

## Usage

### Basic Usage

```typescript
import { createCareerPathIntelligenceEngine } from '@/intelligence/career-path-intelligence';

const engine = createCareerPathIntelligenceEngine();

const analysis = engine.analyze({
  studentProfile: {
    id: 'student-123',
    currentEducationLevel: 'SCHOOL_12',
    yearsOfExperience: 0,
    skills: ['Problem Solving', 'Communication'],
    credentials: ['Class 12 - Science'],
    certifications: [],
    financialConstraints: {
      maxInvestment: 2000000,
      monthlyBudget: 50000,
      canTakeLoan: true,
    },
    timeConstraints: {
      maxDuration: 60,
      hoursPerWeek: 40,
      canRelocate: true,
    },
    locationConstraints: {
      preferredLocations: ['Bangalore', 'Hyderabad'],
      forbiddenLocations: [],
      remotePreference: 'OPEN',
    },
    riskTolerance: 'MODERATE',
    preferredPathTypes: ['DIRECT', 'CORPORATE'],
    careerGoals: ['Product Manager'],
  },
  targetCareer: 'Product Manager',
  timestamp: Date.now(),
});

// Access primary path
console.log(analysis.primaryPath.name);
console.log(analysis.primaryPath.duration);

// Access alternative paths
console.log(analysis.alternativePaths.planB.name);
console.log(analysis.alternativePaths.planC.name);

// Get recommendations
analysis.recommendations.forEach(rec => {
  console.log(`${rec.rank}. ${rec.pathName} - ${rec.rationale.join(', ')}`);
});
```

### Quick Analysis

```typescript
const quickResult = engine.quickAnalyze(input);

console.log(quickResult.pathCount);           // Number of valid paths
console.log(quickResult.topPath);             // Best path name
console.log(quickResult.duration);            // Duration in months
console.log(quickResult.estimatedCost);       // Cost in INR
console.log(quickResult.alternativesAvailable); // Boolean
```

### Custom Configuration

```typescript
const engine = createCareerPathIntelligenceEngine({
  engine: {
    maxPathsToDiscover: 15,
    minPathConfidence: 0.4,
    includeNonTraditionalPaths: true,
    includeEntrepreneurialPaths: true,
    strictValidation: true,
    generatePlanB: true,
    generatePlanC: true,
    generatePlanD: true,
    considerIndianExams: true,
    considerFamilyBusiness: true,
  },
  discovery: {
    maxPaths: 20,
    includeIndiaPaths: true,
  },
  validation: {
    strictMode: true,
    minimumScore: 0.6,
  },
});
```

## Path Comparison

The engine compares paths across 6 dimensions:

| Dimension | Description |
|-----------|-------------|
| **Difficulty** | How hard is the path? |
| **Risk** | Probability of failure |
| **Cost** | Financial investment required |
| **Duration** | Time to completion |
| **Optionality** | Future flexibility and pivot options |
| **Utility** | ROI and career value |

```typescript
const comparison = analysis.pathComparison;

// See which path is easiest
console.log(comparison.difficulty.bestPathId);

// See which path has lowest risk
console.log(comparison.risk.bestPathId);

// See fit scores for your profile
Object.entries(comparison.fitScores).forEach(([pathId, score]) => {
  console.log(`${pathId}: ${(score * 100).toFixed(0)}% match`);
});
```

## Failure Recovery

```typescript
// Get recovery plan for a specific milestone
const milestone = path.milestones[0];
const recoveryPlan = engine.getRecoveryPlan(path, milestone.id, input);

console.log(recoveryPlan.failureReason);
console.log(recoveryPlan.recommendedOption.name);
console.log(recoveryPlan.recommendedOption.successProbability);

// See all recovery options
recoveryPlan.recoveryOptions.forEach(option => {
  console.log(`${option.name}: ${option.strategy}`);
  console.log(`  Cost: ₹${option.cost}, Time: ${option.time} months`);
  console.log(`  Success: ${(option.successProbability * 100).toFixed(0)}%`);
});
```

## Explanations

The engine generates human-readable explanations:

```typescript
const explanation = analysis.explanations[primaryPath.pathId];

console.log(explanation.overview);
// "The Engineering Route Path to Product Manager is a DIRECT route..."

console.log(explanation.journeyDescription);
// "Your journey begins with B.Tech at IIT, where you will..."

console.log(explanation.fitExplanation);
// "This path fits comfortably within your stated budget..."

console.log(explanation.riskNarrative);
// "This path carries moderate risk. Some milestones have..."
```

## Integration with India Intelligence

The Career Path Intelligence Engine integrates with the India Intelligence Layer:

```typescript
import { createIndiaIntelligenceEngine } from '@/intelligence/india-intelligence';

// For India-specific analysis
const indiaEngine = createIndiaIntelligenceEngine();
const indiaAnalysis = indiaEngine.analyze(indiaInput);

// Combine with Career Path Intelligence
const analysis = careerPathEngine.analyze({
  ...input,
  // Engine will automatically consider JEE/NEET/UPSC/CA pathways
  // based on student profile and target career
});
```

## Testing

```bash
# Run all tests
npm test src/intelligence/career-path-intelligence

# Run specific test file
npm test src/intelligence/career-path-intelligence/__tests__/CareerPathIntelligenceEngine.test.ts

# Run with coverage
npm test -- --coverage src/intelligence/career-path-intelligence
```

## File Structure

```
src/intelligence/career-path-intelligence/
├── index.ts                          # Main exports
├── types.ts                          # Type definitions
├── CareerPathIntelligenceEngine.ts   # Main orchestrator
├── engines/
│   ├── PathDiscoveryEngine.ts        # Path generation
│   ├── PathValidationEngine.ts       # Feasibility checking
│   ├── MilestoneEngine.ts            # Milestone management
│   ├── AlternativePathEngine.ts      # Plan B/C/D generation
│   ├── FailureRecoveryEngine.ts      # Recovery planning
│   ├── PathComparisonEngine.ts       # Multi-dimensional comparison
│   └── PathExplanationEngine.ts      # Narrative generation
├── data/
│   ├── indian-pathways.ts            # India-specific pathways
│   └── index.ts                      # Data exports
├── __examples__/
│   └── complete-example.ts           # Full usage example
└── __tests__/
    └── CareerPathIntelligenceEngine.test.ts
```

## Key Outputs

| Output | Description |
|--------|-------------|
| `CareerPath` | Complete path definition with milestones |
| `PathComparison` | Multi-dimensional path comparison |
| `PathRecommendation` | Ranked recommendations with rationale |
| `RecoveryPlan` | Failure recovery options |
| `MilestonePlan` | Detailed milestone planning |
| `PathExplanation` | Human-readable narratives |

## Design Principles

1. **Pathway-Centric** - Focus on routes, not just destinations
2. **Failure-Aware** - Every path includes recovery options
3. **Optionality-First** - Calculate future flexibility at every stage
4. **India-Native** - Built for Indian education and career reality
5. **Multi-Path** - Students always see multiple options
6. **Explainable** - Every recommendation has clear rationale

## License

Internal CareerOS Module
