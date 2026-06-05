# CareerOS - Outcome Tracking Engine

## Overview

The Outcome Tracking Engine is CareerOS's intelligence feedback system. It tracks the complete lifecycle of recommendations to learn whether they actually work.

**Core Philosophy**: This is not analytics. This is not user tracking. This is intelligence feedback.

**Goal**: CareerOS must learn whether its recommendations actually work.

---

## Architecture

### Main Engine

```
OutcomeTrackingEngine
├── RecommendationTracker
├── DecisionTracker
├── ActionTracker
├── OutcomeTracker
├── FeedbackEngine
├── LearningEngine
├── ConfidenceCalibrationEngine
├── RecommendationQualityEngine
├── CohortEngine
└── PrivacyAggregationEngine
```

### Tracking Flow

```
Recommendation → Decision → Action → Outcome
     ↓               ↓         ↓         ↓
   Presented    Selected   Progress   Achieved
   to Student    Option    Tracked    Results
```

---

## Event Types

### 1. Recommendation Event

Tracks when a recommendation is presented to a student.

**Fields**:
- `recommendationId` - Unique recommendation identifier
- `studentId` - Student who received the recommendation (hashed for privacy)
- `recommendationType` - Type of recommendation presented
- `timestamp` - When recommendation was presented
- `context` - Presentation context (channel, rank position, interaction data)

### 2. Decision Event

Tracks when a student makes a decision about a recommendation.

**Fields**:
- `selectedOption` - Career option chosen
- `rejectedOptions` - Options that were rejected
- `confidence` - Decision confidence (0-100)
- `rationale` - Student's decision rationale

### 3. Action Event

Tracks actions taken by a student toward their career goal.

**Fields**:
- `actionsTaken` - List of actions with completion status
- `milestonesCompleted` - Milestones achieved
- `progressStatus` - Overall progress tracking

### 4. Outcome Event

Tracks the final outcome achieved by a student.

**Fields**:
- `achievedOutcome` - Whether desired outcome was achieved
- `timeline` - Timeline metrics (days to outcome, variance)
- `satisfaction` - Satisfaction metrics across dimensions
- `utility` - Utility realization metrics
- `regret` - Regret metrics and "would choose again"
- `optionality` - Career mobility and options analysis
- `dimensions` - Detailed outcome dimensions (8 dimensions)

---

## Outcome Dimensions

The engine tracks outcomes across 8 key dimensions:

1. **Career Progress** - Job level, role achieved, industry entered
2. **Income Growth** - Starting income, current income, growth percentage
3. **Skill Growth** - Skills acquired, proficiency levels, certifications
4. **Life Satisfaction** - Work-life balance, location, relationships, health
5. **Stress Levels** - Work stress, financial stress, uncertainty stress
6. **Learning Growth** - Learning opportunities, mentorship quality, growth velocity
7. **Career Mobility** - Internal/external mobility options, promotion velocity
8. **Goal Achievement** - Goals achieved, in progress, abandoned, new goals set

---

## Sub-Engines

### Learning Engine

Discovers patterns from outcome data using statistical analysis.

**Pattern Types**:
- `ARCHETYPE_OUTCOME` - Archetype-based success patterns
- `DECISION_OUTCOME` - Decision confidence vs outcomes
- `ACTION_OUTCOME` - Action completion vs outcomes
- `COHORT_OUTCOME` - Cohort-specific patterns
- `PATHWAY_SUCCESS` - Successful pathway patterns
- `PATHWAY_FAILURE` - Failure pathway patterns

**Example Pattern**:
```
Founder Archetype + High Autonomy + High Risk Tolerance
↓
Startup Path
↓
Above-average satisfaction (78% success rate)
```

### Confidence Calibration Engine

Compares predicted outcomes vs actual outcomes and adjusts confidence.

**Key Functions**:
- Analyzes calibration across all dimensions
- Detects systematic bias (overconfident/underconfident)
- Generates calibration reports
- Applies calibration adjustments
- Tracks calibration trends over time

**Calibration Metrics**:
- Mean Absolute Error
- Root Mean Squared Error
- Bias direction and magnitude
- Confidence calibration curve
- Brier score

### Recommendation Quality Engine

Calculates recommendation accuracy across multiple dimensions.

**Accuracy Dimensions**:
- Recommendation Accuracy - Overall prediction accuracy
- Utility Accuracy - Utility prediction accuracy
- Regret Accuracy - Regret prediction accuracy
- Optionality Accuracy - Optionality prediction accuracy
- Simulation Accuracy - Timeline and milestone accuracy

**Quality Reports Include**:
- Overall quality grade (A-F)
- Year-over-year improvement
- Critical issues identification
- Improvement opportunities
- Action items with priorities

### Cohort Engine

Creates and manages student cohorts for aggregate analysis.

**Cohort Types**:
- `ARCHETYPE` - Based on student archetype
- `DEMOGRAPHIC` - Based on demographic factors
- `BEHAVIORAL` - Based on behavior patterns
- `OUTCOME` - Based on outcome patterns
- `COMPOSITE` - Combination of multiple factors

**Predefined Cohorts**:
- Founder + Tier 2 City + Engineering Student
- Researcher + NEET Aspirant
- Builder + Career Switcher

### Privacy Aggregation Engine

Ensures privacy-safe data access with no individual exposure.

**Privacy Principles**:
- Minimum cohort size: 10
- Minimum sample size for reporting: 30
- Only aggregate intelligence
- No personal data leakage
- No individual exposure

**Aggregation Methods**:
- K-anonymity
- L-diversity
- Differential privacy (optional)
- Data suppression for small groups

---

## Insight Generation

The engine generates personalized insights for students:

**Insight Types**:
- Choice patterns - What similar students typically choose
- Regret patterns - What similar students often regret
- Success patterns - What leads to success for similar students
- Failure patterns - What leads to failure for similar students
- Timing insights - Optimal timing patterns
- Pathway insights - Successful pathway patterns

**Example Insight**:
```
"Students similar to you often:
- Choose startup paths (65% of cases)
- Regret not building skills first (42% regret rate)
- Succeed through mentorship (3x higher success rate)"
```

---

## Outputs

### 1. OutcomeRecord

Complete record linking recommendation to final outcome:
- Full event chain (recommendation → decision → action → outcome)
- Derived insights
- Learning data (privacy-safe)
- Data quality scores

### 2. OutcomeAnalysis

Comprehensive analysis of outcomes:
- Success/failure patterns
- Key success factors
- Key failure factors
- Unexpected outcomes

### 3. CohortInsights

Privacy-safe insights for cohorts:
- Success rates by cohort
- Predictive factors
- Comparative analysis
- Recommendations

### 4. CalibrationReport

Detailed calibration analysis:
- Overall calibration health
- Per-dimension calibration
- Bias analysis
- Recommended adjustments
- Historical trends

### 5. RecommendationAccuracyReport

Comprehensive quality report:
- Overall quality grade
- Per-dimension accuracy
- Issue identification
- Improvement opportunities
- Action items

---

## Usage Example

```typescript
import { OutcomeTrackingEngine } from '@/outcome-tracking';

// Initialize engine
const engine = new OutcomeTrackingEngine({
  enableLearning: true,
  enableCalibration: true,
  enableQualityTracking: true,
  enableCohorts: true,
});

// Track recommendation presented
const recEventId = await engine.trackRecommendation({
  recommendationId: 'rec_123',
  studentId: 'student_456',
  recommendationType: 'CAREER_PATH',
  timestamp: new Date(),
  context: {
    sessionId: 'session_789',
    presentationChannel: 'DASHBOARD',
    rankPosition: 1,
    wasInteracted: true,
  },
});

// Track student decision
const decEventId = await engine.trackDecision({
  recommendationEventId: recEventId,
  studentId: 'student_456',
  timestamp: new Date(),
  selectedOption: {
    careerId: 'career_startup',
    careerTitle: 'Startup Founder',
    relationshipToRecommendation: 'ACCEPTED',
    matchesRecommendation: true,
  },
  rejectedOptions: [...],
  confidence: 85,
  rationale: { ... },
});

// Track actions taken
const actEventId = await engine.trackAction({
  decisionEventId: decEventId,
  studentId: 'student_456',
  timestamp: new Date(),
  actionsTaken: [...],
  milestonesCompleted: [...],
  progressStatus: { ... },
});

// Track final outcome
await engine.trackOutcome({
  actionEventId: actEventId,
  studentId: 'student_456',
  timestamp: new Date(),
  achievedOutcome: true,
  timeline: { ... },
  satisfaction: { ... },
  utility: { ... },
  regret: { ... },
  optionality: { ... },
  dimensions: { ... },
});

// Generate insights for a student
const insights = await engine.generateInsights({
  studentId: 'student_456',
  cohortIds: ['cohort_founder_tier2_engineer'],
  archetypeProfile: { ... },
  maxInsights: 5,
});

// Generate calibration report
const calibrationReport = await engine.generateCalibrationReport({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
});

// Generate quality report
const qualityReport = await engine.generateQualityReport({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
});
```

---

## Success Criteria

1. **CareerOS becomes smarter every year** - Continuous learning from outcomes
2. **Recommendations improve through feedback** - Quality increases over time
3. **Privacy is preserved** - No individual data exposure
4. **Patterns are discovered** - Statistical patterns emerge from aggregate data
5. **Confidence is calibrated** - Predictions become more accurate over time

---

## File Structure

```
src/outcome-tracking/
├── index.ts                          # Main exports
├── types/
│   ├── index.ts                      # Type exports
│   ├── outcome-tracking-types.ts     # Core tracking types
│   ├── learning-engine-types.ts      # Learning engine types
│   ├── confidence-calibration-types.ts # Calibration types
│   ├── recommendation-quality-types.ts # Quality engine types
│   ├── cohort-engine-types.ts        # Cohort engine types
│   └── privacy-aggregation-types.ts  # Privacy types
└── engines/
    ├── index.ts                      # Engine exports
    ├── outcome-tracking-engine.ts    # Main orchestrator
    ├── recommendation-tracker.ts     # Recommendation tracking
    ├── decision-tracker.ts          # Decision tracking
    ├── action-tracker.ts            # Action tracking
    ├── outcome-tracker.ts            # Outcome tracking
    ├── feedback-engine.ts            # Feedback analysis
    ├── learning-engine.ts            # Pattern learning
    ├── confidence-calibration-engine.ts # Confidence calibration
    ├── recommendation-quality-engine.ts # Quality tracking
    ├── cohort-engine.ts              # Cohort management
    └── privacy-aggregation-engine.ts # Privacy-safe aggregation
```

---

## Integration Points

- **Recommendation System** - Provides recommendations to track
- **Assessment Engine** - Provides student profiles for cohort matching
- **Intelligence Engine** - Uses learned patterns to improve recommendations
- **Database Layer** - Stores outcome records (production)
- **Analytics Pipeline** - Feeds aggregate data to analytics

---

## Future Enhancements

1. **Real-time Learning** - Incremental pattern updates
2. **Multi-armed Bandit** - Exploration/exploitation for recommendations
3. **Causal Inference** - Distinguish correlation from causation
4. **A/B Testing Framework** - Structured recommendation experiments
5. **External Data Integration** - Labor market outcomes, salary data
6. **Longitudinal Studies** - 5, 10, 20-year outcome tracking
