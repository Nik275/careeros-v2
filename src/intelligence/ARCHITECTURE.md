# CareerOS Intelligence Foundation Architecture

## Overview

CareerOS is a **Career Intelligence System**, not a career recommendation website. This document describes the foundational architecture that enables intelligent, personalized career guidance.

### Core Principle

**Assessment answers NEVER directly generate recommendations.**

Instead, data flows through a multi-stage pipeline:

```
Assessment Answers 
    ↓
StudentBelief (Central Source of Truth)
    ↓
[DecisionCoalition, PathCascade, RegretEngine]
    ↓
RecommendationEngine
    ↓
CareerRecommendation + MentorEngine
```

This architecture ensures:
- **Explainability**: Every recommendation can be traced back to beliefs and reasoning
- **Flexibility**: New engines can be added without changing existing ones
- **Testability**: Each component can be tested in isolation
- **Evolution**: Beliefs can be updated as we learn more about the student

---

## System Architecture

### 1. StudentBelief (Central Source of Truth)

**Purpose**: Maintain a comprehensive, evidence-based model of each student.

**Location**: `src/intelligence/student-model/StudentBelief.ts`

**Key Concepts**:
- **Motivations**: What drives the student (creativity, impact, mastery, etc.)
- **Strengths**: What the student is good at (cognitive, social, technical, etc.)
- **Values**: What the student cares about (work-life balance, growth, purpose, etc.)
- **Personality Traits**: How the student thinks and behaves
- **Lifestyle Preferences**: How the student wants to live and work
- **Constraints**: Hard and soft limitations on options

**Key Features**:
- Every belief has **confidence scores** and **evidence sources**
- Beliefs are **versioned** for evolution tracking
- Beliefs can be **explicit** (from assessment) or **inferred** (from patterns)

**Usage**:
```typescript
// Build from assessment answers
const belief = createStudentBeliefFromAssessment(studentId, answers);

// Query beliefs
const query = queryStudentBelief(belief);
const topMotivations = query.getStrongMotivations(0.7);
const nonNegotiableValues = query.getNonNegotiableValues();

// Update with new information
const updatedBelief = new StudentBeliefBuilder(studentId, belief)
  .addMotivation(newMotivation)
  .markEngineContribution('behavior-analysis')
  .build();
```

**Dependencies**: None (foundational layer)

**Future Expansion**:
- Behavioral inference from interaction patterns
- External data integration (grades, activities, etc.)
- Belief validation through follow-up questions
- Belief uncertainty quantification

---

### 2. DecisionCoalition Engine

**Purpose**: Evaluate career options from multiple perspectives using a "voting" system.

**Location**: `src/intelligence/decision-coalition/DecisionCoalitionEngine.ts`

**Key Concepts**:
- **Voters**: Represent different aspects of student profile (motivations, strengths, values, etc.)
- **Votes**: Each voter scores career options
- **Coalition**: Collection of all voters for a student
- **Aggregation**: Combines votes into collective decision

**Why This Approach**:
- No single factor dominates decisions
- Multiple perspectives create balanced recommendations
- Disagreement between voters signals areas needing exploration
- Configurable aggregation methods (weighted average, majority, Borda count, etc.)

**Usage**:
```typescript
const engine = createDecisionCoalitionEngine({
  aggregationMethod: AggregationMethod.WEIGHTED_AVERAGE,
  explicitVoterWeight: 1.0,
  inferredVoterWeight: 0.7,
});

const coalition = engine.formCoalition(studentBelief);
const result = await engine.evaluateCareers(coalition, careerOptions);

// Access results
const rankedCareers = result.rankedCareers;
const conflicts = result.conflicts; // Where voters disagree
```

**Inputs**:
- StudentBelief (reads motivations, strengths, values, etc.)
- CareerNode[] (options to evaluate)

**Outputs**:
- DecisionCoalition (complete voting record)
- RankedCareer[] (options sorted by coalition score)
- CoalitionConflict[] (areas of voter disagreement)

**Dependencies**:
- StudentBelief (reads from)

**Future Expansion**:
- Different voting algorithms (Condorcet, Borda, etc.)
- Dynamic voter weight adjustment
- Conflict resolution strategies
- Historical voting pattern analysis

---

### 3. PathCascade Engine

**Purpose**: Generate multi-step career paths through the career graph.

**Location**: `src/intelligence/path-cascade/PathCascadeEngine.ts`

**Key Concepts**:
- **CareerNode**: Single career position
- **CareerEdge**: Possible transition between careers
- **CareerPath**: Sequence of nodes connected by edges
- **Cascade**: Multiple paths generated and ranked

**Why This Approach**:
- Career decisions are sequences over decades, not one-time choices
- Long-term trajectories matter more than single jobs
- Alternative paths at each step provide flexibility
- Path scoring considers multiple dimensions

**Usage**:
```typescript
const engine = createPathCascadeEngine(careerGraph, {
  maxPathLength: 4,
  maxTimeHorizon: 15,
  numPathsToGenerate: 10,
});

const result = await engine.generatePaths(studentBelief);

// Access results
const topPaths = result.paths; // Sorted by quality
const alternatives = result.alternatives; // Options at each step
const stats = result.statistics; // Generation metrics
```

**Inputs**:
- StudentBelief (profile for path generation)
- CareerGraph (nodes and edges)
- PathCascadeConfig (generation parameters)

**Outputs**:
- CareerPath[] (generated paths sorted by quality)
- PathScores (detailed scoring for each path)
- PathGenerationStatistics (generation metrics)

**Dependencies**:
- StudentBelief (reads from)
- CareerGraph (reads from)
- DecisionCoalition (optionally uses for node scoring)

**Future Expansion**:
- Probabilistic path modeling
- Monte Carlo simulation of outcomes
- Real-time market data integration
- Path optimization with constraints

---

### 4. Regret Engine

**Purpose**: Predict potential future regrets for career decisions.

**Location**: `src/intelligence/regret-engine/RegretEngine.ts`

**Key Concepts**:
- **RegretPrediction**: Predicted future regret for a decision
- **RegretType**: Categories (missed opportunity, value conflict, stagnation, etc.)
- **Mitigation**: Strategies to reduce predicted regret
- **Historical Data**: Past career outcomes and reported regrets

**Why This Approach**:
- Regret is a key signal in career decision-making
- Predicting regrets BEFORE they happen enables prevention
- Different regret types require different mitigations
- Historical data improves prediction accuracy

**Regret Types**:
1. **Missed Opportunity**: Chose safe over dream
2. **Wrong Values**: Compromised on important values
3. **Unrealized Potential**: Didn't use strengths
4. **Lifestyle Mismatch**: Work-life balance issues
5. **Financial Regret**: Salary/cost of living issues
6. **Stagnation**: No growth or learning

**Usage**:
```typescript
const engine = createRegretEngine(historicalData, {
  predictionHorizon: 10,
  minLikelihoodThreshold: 0.3,
});

const result = await engine.analyzePath(path, studentBelief);

// Access results
const predictions = result.predictions;
const overallRisk = result.overallRegretRisk;
const mitigations = result.mitigations;
```

**Inputs**:
- StudentBelief (especially values and constraints)
- CareerPath (path to analyze)
- HistoricalRegretData[] (past outcomes)

**Outputs**:
- RegretPrediction[] (predicted regrets)
- RegretScore (overall risk)
- RegretMitigation[] (strategies to reduce risk)

**Dependencies**:
- StudentBelief (reads from)
- CareerPath (analyzes)
- PathCascade (optionally uses for alternative comparison)

**Future Expansion**:
- Machine learning models trained on reported regrets
- Personalized prediction based on similar profiles
- Real-time regret monitoring as careers progress
- Integration with longitudinal career outcome data

---

### 5. Recommendation Engine

**Purpose**: Synthesize all inputs into final, actionable career recommendations.

**Location**: `src/intelligence/recommendation-engine/RecommendationEngine.ts`

**Key Concepts**:
- **CareerRecommendation**: Final recommendation output
- **RecommendationReasoning**: Detailed explanation of why
- **RecommendationConcern**: Potential issues to be aware of
- **NextStep**: Concrete actions to take

**Why This Approach**:
- Recommendations are the result of a multi-stage pipeline
- Full reasoning enables trust and understanding
- Concerns provide balanced perspective
- Next steps make recommendations actionable

**Usage**:
```typescript
const engine = createRecommendationEngine({
  numRecommendations: 3,
  minConfidence: 0.5,
  maxRegretRisk: 0.7,
});

const input: RecommendationInput = {
  studentBelief,
  pathResults,
  regretResults,
};

const result = await engine.generateRecommendations(input);

// Access results
const recommendations = result.recommendations;
const summary = result.summary;
const stats = result.statistics;
```

**Inputs**:
- StudentBelief (profile)
- PathCascadeResult (generated paths)
- RegretAnalysisResult[] (risk assessments)
- DecisionCoalitionResult (optional, for scoring)

**Outputs**:
- CareerRecommendation[] (ranked recommendations)
- RecommendationSummary (high-level summary)
- RecommendationStatistics (generation metrics)

**Dependencies**:
- StudentBelief (reads from)
- PathCascade (uses for paths)
- RegretEngine (uses for risk assessment)
- DecisionCoalition (optionally uses for scoring)

**Future Expansion**:
- A/B testing of recommendation strategies
- Personalized explanation styles
- Integration with job market APIs
- Human-in-the-loop validation

---

### 6. Mentor Engine

**Purpose**: Provide personalized, context-aware guidance through conversation.

**Location**: `src/intelligence/mentor/MentorEngine.ts`

**Key Concepts**:
- **MentorContext**: Complete context for interactions
- **MentorInteraction**: Single exchange between student and mentor
- **EmotionalState**: Student's current emotional condition
- **GuidanceStrategy**: How mentor should respond

**Why This Approach**:
- Career decisions involve uncertainty and emotion
- Students need guidance, not just information
- Context-aware responses feel personal and relevant
- Conversation history enables evolving understanding

**Response Types**:
1. **Guidance**: General direction and advice
2. **Clarification**: Help understanding concepts
3. **Encouragement**: Build confidence and motivation
4. **Reality Check**: Honest assessment of challenges
5. **Exploration**: Deep dive into specific topics
6. **Action Suggestion**: Concrete next steps

**Usage**:
```typescript
const engine = createMentorEngine({
  tone: 'SUPPORTIVE',
  detailLevel: 'MODERATE',
  emotionalAwareness: true,
});

const input: MentorInput = {
  studentInput: "I'm worried about choosing the wrong path",
  studentBelief,
  currentRecommendation,
  conversationHistory,
  emotionalState: EmotionalState.ANXIOUS,
};

const result = await engine.processInteraction(input);

// Access results
const response = result.response;
const insights = result.insights;
const suggestedTopics = result.suggestedTopics;
```

**Inputs**:
- StudentBelief (profile)
- StudentInput (question or statement)
- CurrentRecommendation (what they're exploring)
- ConversationHistory (previous interactions)
- EmotionalState (if detected)

**Outputs**:
- MentorResponse (personalized guidance)
- InteractionInsight[] (what we learned)
- SuggestedTopics (follow-up directions)

**Dependencies**:
- StudentBelief (reads from)
- RecommendationEngine (uses for context)
- RegretEngine (uses for risk discussion)
- PathCascade (uses for alternative exploration)

**Future Expansion**:
- Multi-modal interactions (voice, video)
- Proactive guidance (reaching out)
- Integration with human mentors
- Cultural and linguistic adaptation

---

## Data Flow

### Assessment to Recommendation Flow

```
1. Student completes assessment
   ↓
2. Assessment answers → StudentBeliefBuilder
   ↓
3. StudentBelief created (central source of truth)
   ↓
4. Parallel engine execution:
   ├─ PathCascadeEngine.generatePaths(belief)
   ├─ DecisionCoalitionEngine.formCoalition(belief)
   └─ (other engines as needed)
   ↓
5. RegretEngine.analyzePath() for each path
   ↓
6. RecommendationEngine.generateRecommendations()
   ├─ Scores paths
   ├─ Filters by quality
   ├─ Generates reasoning
   ├─ Identifies concerns
   └─ Creates next steps
   ↓
7. CareerRecommendation[] output
   ↓
8. MentorEngine provides ongoing guidance
```

### Key Design Decisions

1. **StudentBelief is Immutable**: Updates create new versions, enabling:
   - Belief evolution tracking
   - A/B testing of inference methods
   - Debugging and explainability

2. **Engines are Stateless**: They read from StudentBelief, not internal state:
   - Easier testing
   - Parallel execution
   - No hidden dependencies

3. **Confidence Scores Everywhere**: Every belief and prediction has confidence:
   - Weighted decision making
   - Uncertainty quantification
   - Quality thresholds

4. **Evidence Tracking**: Every belief has evidence sources:
   - Explainability
   - Debugging
   - Validation

---

## Type System

All types are defined in `src/intelligence/types/index.ts`:

### Core Types
- `StudentBelief`: Central student model
- `CareerNode`: Single career position
- `CareerEdge`: Transition between careers
- `CareerPath`: Sequence of nodes and edges
- `CareerRecommendation`: Final recommendation

### Belief Types
- `Motivation`: What drives the student
- `Strength`: What the student is good at
- `Value`: What the student cares about
- `PersonalityTrait`: How the student thinks
- `LifestylePreference`: How the student wants to live
- `Constraint`: Limitations on options

### Engine Types
- `DecisionCoalition`: Voting system
- `Voter`: Individual perspective
- `Vote`: Scoring of an option
- `RegretPrediction`: Predicted future regret
- `MentorContext`: Conversation context
- `MentorInteraction`: Single exchange

### Supporting Types
- `ConfidenceScore`: 0.0 to 1.0 certainty
- `Evidence`: Source and reasoning
- `EvidenceSource`: How belief was derived
- `EntityId`: Unique identifier

---

## Testing Strategy

Each engine can be tested in isolation:

```typescript
// Test StudentBelief
const belief = createStudentBeliefFromAssessment(studentId, mockAnswers);
expect(belief.motivations).toHaveLength(3);
expect(belief.overallConfidence).toBeGreaterThan(0.5);

// Test DecisionCoalition
const coalition = engine.formCoalition(belief);
const result = await engine.evaluateCareers(coalition, mockCareers);
expect(result.rankedCareers[0].score).toBeGreaterThan(0.6);

// Test PathCascade
const result = await engine.generatePaths(belief);
expect(result.paths).toHaveLength.greaterThan(0);
expect(result.paths[0].scores.overall).toBeGreaterThan(0.5);

// Test RegretEngine
const result = await engine.analyzePath(path, belief);
expect(result.predictions).toBeDefined();
expect(result.overallRegretRisk).toBeLessThan(1.0);

// Test RecommendationEngine
const result = await engine.generateRecommendations(input);
expect(result.recommendations).toHaveLength.greaterThan(0);
expect(result.recommendations[0].reasoning).toBeDefined();

// Test MentorEngine
const result = await engine.processInteraction(input);
expect(result.response.text).toBeDefined();
expect(result.response.suggestedActions).toHaveLength.greaterThan(0);
```

---

## Future Expansion

### Near Term (V2)
1. **Behavioral Inference**: Infer beliefs from interaction patterns
2. **External Data**: Import grades, activities, etc.
3. **Real-time Market Data**: Live salary and demand data
4. **Human Mentor Integration**: Escalation to human mentors

### Medium Term (V3)
1. **Machine Learning**: Train models on career outcomes
2. **Probabilistic Paths**: Monte Carlo simulation
3. **Multi-modal**: Voice and video interactions
4. **Cultural Adaptation**: Region-specific guidance

### Long Term (V4)
1. **Predictive Analytics**: Predict career changes before they happen
2. **Network Effects**: Learn from similar profiles
3. **Autonomous Guidance**: Proactive mentor outreach
4. **Ecosystem Integration**: Connect with employers, schools

---

## Getting Started

```typescript
// 1. Import types and engines
import { 
  createStudentBeliefFromAssessment,
  createPathCascadeEngine,
  createRegretEngine,
  createRecommendationEngine,
  createMentorEngine,
} from '@/intelligence';

// 2. Create StudentBelief from assessment
const belief = createStudentBeliefFromAssessment(studentId, answers);

// 3. Generate paths
const pathEngine = createPathCascadeEngine(careerGraph);
const pathResult = await pathEngine.generatePaths(belief);

// 4. Analyze regrets
const regretEngine = createRegretEngine();
const regretResults = new Map();
for (const path of pathResult.paths) {
  const regret = await regretEngine.analyzePath(path, belief);
  regretResults.set(path.id, regret);
}

// 5. Generate recommendations
const recEngine = createRecommendationEngine();
const recResult = await recEngine.generateRecommendations({
  studentBelief: belief,
  pathResults: pathResult,
  regretResults,
});

// 6. Provide mentor guidance
const mentorEngine = createMentorEngine();
const mentorResult = await mentorEngine.processInteraction({
  studentInput: "Tell me more about the first recommendation",
  studentBelief: belief,
  currentRecommendation: recResult.recommendations[0],
  conversationHistory: [],
});
```

---

## Summary

The CareerOS Intelligence Foundation provides:

1. **Clean Architecture**: Clear separation of concerns
2. **Type Safety**: Full TypeScript coverage
3. **Explainability**: Every decision can be traced
4. **Extensibility**: New engines can be added easily
5. **Testability**: Each component testable in isolation
6. **Evolution**: Beliefs and recommendations can evolve

This foundation enables the Frontier Upgrade architecture while remaining simple enough to understand and maintain.
