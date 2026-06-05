# Career Reality Engine

## Overview

The Career Reality Engine is an intelligence system that models what life is actually like in different careers. Unlike traditional career systems that focus on salary, demand, and growth, CareerOS answers:

> **"What is life actually like in this career?"**

## Architecture

```
CareerRealityEngine (Main Orchestrator)
├── DailyLifeEngine
├── WorkEnvironmentEngine
├── BurnoutEngine
├── CultureEngine
├── CompanyStageEngine
├── SatisfactionEngine
└── RealityExplanationEngine
```

## Sub-Engines

### 1. Daily Life Engine

Models time distribution and work patterns:

- **Typical Day**: Time blocks (deep work, meetings, admin, customer interaction, travel, reactive work, learning, social)
- **Typical Week**: Hours per week, weekend/evening work frequency, schedule predictability
- **Typical Month**: Crunch periods, travel days, WFH days, overtime frequency
- **Typical Year**: Seasonal patterns, leave utilization, professional travel
- **Activity Distribution**: Percentages across meeting time, deep work, collaboration, customer interaction, admin, creative work, analytical work
- **Work Rhythm**: Pace, deadline pressure, multi-tasking, context switching, intensity pattern

**Key Insight**: Most careers differ dramatically from student expectations in how time is actually spent.

### 2. Work Environment Engine

Models work environment characteristics:

- **Autonomy**: Decision-making, task, schedule, and method autonomy
- **Structure**: Process formalization, hierarchy clarity, role clarity, reporting formality
- **Bureaucracy**: Approval layers, documentation requirements, policy adherence, red tape
- **Ownership**: End-to-end ownership, accountability clarity, resource control, impact visibility
- **Competition**: Internal competition, market competition, performance ranking, promotion competition
- **Politics**: Organizational politics, stakeholder management, networking importance, visibility importance
- **Flexibility**: Schedule flexibility, location flexibility, work arrangements
- **Physical Environment**: Office type, noise level, commute duration, travel requirements, remote feasibility

**Key Insight**: A Product Manager at a Startup has a completely different environment than one at Enterprise.

### 3. Burnout Engine

Models burnout risk and stress patterns:

- **Overall Risk**: 0-100 score with risk level categorization (LOW/MODERATE/HIGH/SEVERE)
- **Stress Sources**: Primary stressors with impact, frequency, and controllability ratings
- **Stress Frequency**: Daily, weekly, monthly, chronic, acute episodes, crisis frequency
- **Recovery Potential**: Overall score, recovery timeframes, vacation effectiveness, weekend recovery, boundary control
- **Prevention Factors**: Availability and effectiveness of burnout prevention strategies
- **Industry Patterns**: Timeline to burnout, warning signs, common exit points

**Examples**: Investment Banking (85% risk), Medicine (75%), Consulting (70%), Startups (65%)

### 4. Culture Engine

Models culture characteristics and personality fit:

- **Cultural Dimensions**: Collaboration, innovation, results focus, speed focus, transparency, psychological safety, feedback culture, learning culture
- **Values Alignment**: Core values, aligned values, conflicting values, ethical considerations
- **Social Dynamics**: Team orientation, social requirements, networking importance, mentorship availability, community strength, social events importance
- **Personality Fit Analysis**:
  - Who thrives (with fit scores, success factors, challenges)
  - Who struggles (with fit scores, mitigation strategies)
  - Cognitive fit (analytical, creative, practical, social, strategic, detail-oriented)
  - Behavioral fit (extroversion, conscientiousness, openness, agreeableness, emotional stability)
  - Motivational fit (achievement, affiliation, power, autonomy, purpose, security)
  - Work style fit (independence, structure, variety, pace, collaboration)

**Personality Archetypes**: Builder, Researcher, Socializer, Leader, Artist, Organizer, Helper, Entrepreneur

### 5. Company Stage Engine

Models how careers differ across company stages:

**Stages**: Startup, Growth Stage, Mid-Sized Company, Large Enterprise, Government, Family Business

For each stage:
- **Stage Characteristics**: Pace, structure, stability, growth opportunity, risk level, impact visibility, resource availability, process maturity
- **Stage Differences**: How this specific career differs at this stage
- **Work Environment**: Stage-specific environment profile
- **Daily Life**: Stage-specific daily life patterns
- **Satisfaction Profile**: Stage-specific satisfaction patterns

**Example**: A Product Manager at a Startup wears multiple hats, while an Enterprise PM navigates heavy stakeholder management.

### 6. Satisfaction Engine

Models career satisfaction drivers and patterns:

- **Overall Satisfaction**: 0-100 score
- **Satisfaction Drivers**: Importance and satisfaction levels for each driver
- **Common Frustrations**: Frequency, impact, dealbreaker status, mitigation strategies
- **Common Rewards**: Frequency, impact, retention factor status
- **Exit Patterns**: Reasons, frequency, typical timing, destinations
- **Fulfillment Trajectory**: Early career, mid career, late career satisfaction, inflection points

**Trajectory Patterns**: Increasing, Stable, Declining, U-shaped, Inverted-U

### 7. Reality Explanation Engine

Generates career reality explanations and gap analysis:

- **What People Love**: Common sources of joy and fulfillment
- **What People Hate**: Common frustrations and pain points
- **What Surprises People**: Unexpected aspects (positive, negative, mixed) with preparation advice
- **What Nobody Tells You**: Hidden realities of the career
- **The Real Deal**: Honest summary of the career reality
- **Day in the Life**: Hour-by-hour breakdown with variations
- **Reality Gap Analysis**:
  - Common expectations vs reality
  - Specific gaps with magnitude and satisfaction impact
  - Bridging advice for students
- **Career Stories**: Real narratives with context and takeaways

## Output Profiles

### CareerRealityProfile

```typescript
{
  profileId: string;
  careerId: string;
  careerTitle: string;
  dailyLife: DailyLifeProfile;
  workEnvironment: WorkEnvironmentProfile;
  burnoutProfile: BurnoutProfile;
  cultureProfile: CultureProfile;
  satisfactionProfile: SatisfactionProfile;
  realityGap: RealityGapAnalysis;
  personalityFit: CareerPersonalityFit;
  explanations: RealityExplanations;
  metadata: CareerRealityMetadata;
}
```

### RealityProfileScore

```typescript
{
  overall: number;
  dailyLife: number;
  workEnvironment: number;
  burnoutResilience: number;
  culture: number;
  satisfaction: number;
  realityClarity: number;
}
```

## Usage Example

```typescript
import { createCareerRealityEngine } from '@/career-reality';

const engine = createCareerRealityEngine();

// Generate complete reality profile
const profile = engine.generateProfile({
  careerId: 'software-engineer',
  careerTitle: 'Software Engineer',
  companyStage: 'STARTUP',
  experienceLevel: 'MID',
});

// Get scores
const scores = engine.calculateScores(profile);

// Compare careers
const comparison = engine.compareCareers(
  'software-engineer',
  'product-manager',
  'Software Engineer',
  'Product Manager'
);

// Get stage variants
const variants = engine.getStageVariants({
  careerId: 'product-manager',
  careerTitle: 'Product Manager',
});

// Get quick summary
const summary = engine.getQuickSummary(profile);
```

## Success Criteria

A student should finish reading a career profile and clearly understand:

1. **What daily life looks like**: Hours, meetings, deep work, travel, schedule predictability
2. **What sacrifices exist**: Burnout risk, work-life balance, long-term toll
3. **What rewards exist**: Satisfaction drivers, fulfillment trajectory, meaningful work
4. **Whether they can realistically enjoy it**: Personality fit, values alignment, culture match

## Career Templates

The engine includes detailed templates for:

- Software Engineer
- Product Manager
- Investment Banker
- Doctor
- Consultant
- Teacher
- Data Scientist
- Designer
- Sales Representative

Each template includes realistic data based on industry research and professional interviews.

## Scoring System

Scores are normalized to 0-100 scale:

- **0-30**: Critical concern / Poor fit
- **31-50**: Significant challenge / Caution
- **51-70**: Moderate / Acceptable
- **71-90**: Good / Strong fit
- **91-100**: Excellent / Ideal fit

## Future Enhancements

1. **Data Integration**: Connect to real-time salary, review, and job posting data
2. **ML Models**: Train models on exit interview and satisfaction survey data
3. **Personalization**: Adjust profiles based on individual personality assessments
4. **Geographic Variations**: Model regional differences in work culture
5. **Industry Specialization**: More granular templates for sub-industries

## File Structure

```
src/career-reality/
├── index.ts                          # Main exports
├── types/
│   └── career-reality-types.ts       # All TypeScript interfaces
└── engines/
    ├── career-reality-engine.ts      # Main orchestrator
    ├── daily-life-engine.ts          # Time distribution modeling
    ├── work-environment-engine.ts    # Environment characteristics
    ├── burnout-engine.ts             # Stress and burnout modeling
    ├── culture-engine.ts             # Culture and personality fit
    ├── company-stage-engine.ts       # Stage-specific variations
    ├── satisfaction-engine.ts        # Satisfaction patterns
    └── reality-explanation-engine.ts # Reality explanations
```

## Dependencies

No external dependencies. Pure TypeScript implementation.

## License

Part of CareerOS - Internal use only.
