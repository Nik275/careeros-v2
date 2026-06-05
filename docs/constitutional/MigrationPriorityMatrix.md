# Wave 2.5.1 - Migration Priority Matrix

**Audit Date:** 2026-06-05  
**Classification:** Source-of-Truth Constitutional Audit  
**Scope:** Prioritized Migration Roadmap  
**Status:** ROADMAP GENERATED

---

## Executive Summary

Fresh migration roadmap prioritizes **84 shadow authorities** for constitutional migration based on **ownership score**, **centrality**, **consumer count**, and **business impact**. Total migration effort: **420 hours** over **10.5 weeks**.

### Migration Overview

| Phase | Systems | Operations | Effort | Timeline | Priority |
|-------|---------|------------|--------|----------|----------|
| **Phase 1** | 4 | 25 | 80h | Weeks 1-4 | P0 - Critical |
| **Phase 2** | 6 | 17 | 60h | Weeks 5-8 | P1 - Major |
| **Phase 3** | 20 | 54 | 120h | Weeks 9-16 | P2 - Moderate |
| **Phase 4** | 54 | 65 | 160h | Weeks 17-24 | P3 - Minor |
| **TOTAL** | **84** | **161** | **420h** | **24 weeks** | - |

---

## Migration Priority Scoring

### Scoring Formula
```
Priority Score = (Ownership Score × 0.4) + 
                 (Centrality × 0.3) + 
                 (Consumer Count × 0.2) + 
                 (Business Impact × 0.1)
```

### Scoring Components

| Component | Weight | Range | Description |
|-----------|--------|-------|-------------|
| Ownership Score | 40% | 0-100 | Constitutional violation severity |
| Centrality | 30% | 0-10 | Architectural centrality (1-10) |
| Consumer Count | 20% | 0-20 | Number of dependent systems |
| Business Impact | 10% | 0-10 | Business criticality (1-10) |

---

## Phase 1: Critical Priority (P0)

**Timeline**: Weeks 1-4  
**Systems**: 4  
**Operations**: 25  
**Effort**: 80 hours  
**Impact**: 15.5% of violations eliminated

### 1. FounderRoadmapEngineV2
**Priority Score**: 98/100  
**Ownership Score**: 95  
**Centrality**: 10/10  
**Consumers**: 12  
**Business Impact**: 10/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
const criticalGaps = dimensionScores.filter(d => d.score < 0.3).length;
const sorted = dimensionScores.sort((a, b) => a.score - b.score);

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const criticalGaps = authority.selectByThreshold(dimensionScores, 0.3, 'below').length;
const sorted = authority.rank(dimensionScores, { direction: 'asc' });
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 9 local operations
- [ ] Update unit tests
- [ ] Add integration tests
- [ ] Update documentation

**Effort**: 20 hours  
**Dependencies**: None  
**Risk**: High (founder-critical)

---

### 2. FutureExplorerV1
**Priority Score**: 96/100  
**Ownership Score**: 92  
**Centrality**: 10/10  
**Consumers**: 8  
**Business Impact**: 10/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
const sorted = scenarios.sort((a, b) => b.score - a.score)
  .map((s, index) => ({ ...s, rank: index + 1 }));

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const ranked = authority.rank(scenarios, { assignRanks: true });
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 7 local operations
- [ ] Update unit tests
- [ ] Add integration tests
- [ ] Update documentation

**Effort**: 18 hours  
**Dependencies**: None  
**Risk**: High (core feature)

---

### 3. StabilityEngine
**Priority Score**: 94/100  
**Ownership Score**: 88  
**Centrality**: 9/10  
**Consumers**: 6  
**Business Impact**: 9/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
const sorted = [...scores].sort((a, b) => b.score - a.score);

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const sorted = authority.rank(scores);
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 5 local operations
- [ ] Update unit tests
- [ ] Add integration tests
- [ ] Update documentation

**Effort**: 14 hours  
**Dependencies**: None  
**Risk**: Medium (archetype system)

---

### 4. CareerGraphEngine
**Priority Score**: 92/100  
**Ownership Score**: 85  
**Centrality**: 9/10  
**Consumers**: 5  
**Business Impact**: 9/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
.sort((a, b) => b.score - a.score);

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const sorted = authority.rank(paths);
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 4 local operations
- [ ] Update unit tests
- [ ] Add integration tests
- [ ] Update documentation

**Effort**: 12 hours  
**Dependencies**: None  
**Risk**: Medium (navigation system)

---

## Phase 2: Major Priority (P1)

**Timeline**: Weeks 5-8  
**Systems**: 6  
**Operations**: 17  
**Effort**: 60 hours  
**Impact**: 10.6% of violations eliminated

### 5. MatchingEngineV1
**Priority Score**: 88/100  
**Ownership Score**: 78  
**Centrality**: 8/10  
**Consumers**: 4  
**Business Impact**: 8/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
allMatches.sort((a, b) => b.score - a.score);
const qualifying = allMatches.filter(m => m.score >= threshold);

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const ranked = authority.rank(allMatches);
const qualifying = authority.selectByThreshold(ranked, threshold);
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 6 local operations
- [ ] Update unit tests
- [ ] Add integration tests

**Effort**: 12 hours  
**Dependencies**: None  
**Risk**: Medium (matching system)

---

### 6. ProfileInterpreter
**Priority Score**: 85/100  
**Ownership Score**: 75  
**Centrality**: 7/10  
**Consumers**: 3  
**Business Impact**: 8/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
scores.sort((a, b) => b[1].score - a[1].score);
.filter(([, score]) => score.score >= config.minStrengthConfidence);

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const ranked = authority.rank(scores, { key: 'score' });
const strong = authority.selectByThreshold(ranked, config.minStrengthConfidence);
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 5 local operations
- [ ] Update unit tests
- [ ] Add integration tests

**Effort**: 10 hours  
**Dependencies**: None  
**Risk**: Low (profile system)

---

### 7. MAUTFoundationV1
**Priority Score**: 82/100  
**Ownership Score**: 72  
**Centrality**: 8/10  
**Consumers**: 6  
**Business Impact**: 7/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
.sort((a, b) => b.score.overall - a.score.overall);

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const sorted = authority.rank(items, { key: 'score.overall' });
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 1 local operation
- [ ] Update unit tests

**Effort**: 8 hours  
**Dependencies**: None  
**Risk**: Low (utility foundation)

---

### 8. PathComparisonEngine
**Priority Score**: 80/100  
**Ownership Score**: 70  
**Centrality**: 7/10  
**Consumers**: 4  
**Business Impact**: 7/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
// Local comparison logic

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const comparison = authority.compare(paths);
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace comparison logic
- [ ] Update unit tests

**Effort**: 8 hours  
**Dependencies**: None  
**Risk**: Low (path system)

---

### 9. RecommendationRankingEngine
**Priority Score**: 78/100  
**Ownership Score**: 68  
**Centrality**: 7/10  
**Consumers**: 5  
**Business Impact**: 6/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
// Local ranking logic

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const ranked = authority.rank(recommendations);
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace ranking logic
- [ ] Update unit tests

**Effort**: 6 hours  
**Dependencies**: None  
**Risk**: Low (recommendation system)

---

### 10. SimilarStudentEngine
**Priority Score**: 75/100  
**Ownership Score**: 65  
**Centrality**: 6/10  
**Consumers**: 3  
**Business Impact**: 6/10

**Migration Strategy**:
```typescript
// BEFORE (Shadow Authority)
.filter(d => d.score > 0.6)
.sort((a, b) => b.score - a.score);

// AFTER (Constitutional)
import { createDecisionAuthority } from '@/intelligence/decision';
const authority = createDecisionAuthority();
const filtered = authority.selectByThreshold(matches, 0.6);
const sorted = authority.rank(filtered);
```

**Tasks**:
- [ ] Import DecisionAuthority
- [ ] Replace 2 local operations
- [ ] Update unit tests

**Effort**: 6 hours  
**Dependencies**: None  
**Risk**: Low (similarity system)

---

## Phase 3: Moderate Priority (P2)

**Timeline**: Weeks 9-16  
**Systems**: 20  
**Operations**: 54  
**Effort**: 120 hours  
**Impact**: 33.5% of violations eliminated

### Systems 11-30 (Moderate Priority)

| Rank | System | Score | Operations | Effort | Centrality | Consumers |
|------|--------|-------|------------|--------|------------|-----------|
| 11 | UtilityExplanationEngine | 74 | 4 | 8h | 6/10 | 2 |
| 12 | SimilarityExplanationEngine | 72 | 4 | 8h | 6/10 | 2 |
| 13 | InformationGapDetector | 70 | 4 | 8h | 5/10 | 2 |
| 14 | ArchetypeCalculator | 68 | 3 | 6h | 6/10 | 3 |
| 15 | AssessmentEngine | 66 | 3 | 6h | 5/10 | 4 |
| 16 | NEETEngine | 64 | 3 | 6h | 5/10 | 2 |
| 17 | ProfileSynthesizer | 62 | 3 | 6h | 5/10 | 2 |
| 18 | FounderRiskProfileEngine | 60 | 3 | 6h | 5/10 | 2 |
| 19 | SkillTransitionEngine | 58 | 3 | 6h | 5/10 | 2 |
| 20 | OptionalityEngine | 56 | 3 | 6h | 5/10 | 2 |
| 21 | IrreversibilityEngine | 54 | 3 | 6h | 5/10 | 2 |
| 22 | ArchetypeDetectionEngine | 52 | 2 | 4h | 5/10 | 3 |
| 23 | CareerIntelligenceEngine | 50 | 2 | 4h | 5/10 | 3 |
| 24 | CareerRecommendationEngine | 48 | 2 | 4h | 5/10 | 3 |
| 25 | DecisionIntelligenceEngine | 46 | 2 | 4h | 5/10 | 3 |
| 26 | JEEEngine | 44 | 2 | 4h | 4/10 | 3 |
| 27 | RecommendationEngine | 42 | 2 | 4h | 4/10 | 3 |
| 28 | JourneyMatcher | 40 | 2 | 4h | 4/10 | 2 |
| 29 | JourneySimilarityEngine | 38 | 2 | 4h | 4/10 | 2 |
| 30 | ComparisonFactories | 36 | 8 | 16h | 4/10 | 1 |

**Total Phase 3 Effort**: 120 hours

---

## Phase 4: Minor Priority (P3)

**Timeline**: Weeks 17-24  
**Systems**: 54  
**Operations**: 65  
**Effort**: 160 hours  
**Impact**: 41.0% of violations eliminated

### Systems 31-84 (Minor Priority)

Systems with scores 21-40, 1-2 operations each, low centrality, few consumers.

**Migration Strategy**:
- Batch similar migrations
- Use codemods where possible
- Standardize patterns
- Parallel execution

**Total Phase 4 Effort**: 160 hours

---

## Migration Dependencies

### Dependency Graph

```
Phase 1 (Critical)
├── No dependencies
└── Blocks: Phase 2 systems that consume these

Phase 2 (Major)
├── Depends on: Phase 1 (for shared utilities)
└── Blocks: Phase 3 systems

Phase 3 (Moderate)
├── Depends on: Phase 1, Phase 2
└── Blocks: None

Phase 4 (Minor)
├── Depends on: Phase 1, Phase 2, Phase 3
└── Blocks: None
```

### Critical Path

1. **Week 1-2**: FounderRoadmapEngineV2, FutureExplorerV1
2. **Week 3-4**: StabilityEngine, CareerGraphEngine
3. **Week 5-8**: MatchingEngineV1, ProfileInterpreter, MAUTFoundationV1
4. **Week 9-16**: Moderate priority batch
5. **Week 17-24**: Minor priority batch

---

## Resource Allocation

### Team Requirements

| Phase | Engineers | Duration | Total Hours |
|-------|-------------|----------|-------------|
| Phase 1 | 2 senior | 4 weeks | 160h |
| Phase 2 | 2 senior | 4 weeks | 160h |
| Phase 3 | 3 mid-level | 8 weeks | 480h |
| Phase 4 | 2 junior + 1 mid | 8 weeks | 320h |
| **TOTAL** | **Variable** | **24 weeks** | **1120h** |

### Skills Required

- **Senior Engineers**: TypeScript, architectural refactoring, testing
- **Mid-Level Engineers**: TypeScript, API integration, testing
- **Junior Engineers**: TypeScript, pattern matching, testing

---

## Risk Mitigation

### High-Risk Migrations

| System | Risk | Mitigation |
|--------|------|------------|
| FounderRoadmapEngineV2 | Business critical | Feature flags, gradual rollout |
| FutureExplorerV1 | User-facing | A/B testing, rollback plan |
| StabilityEngine | Core archetype | Comprehensive testing |
| CareerGraphEngine | Navigation | Gradual migration, monitoring |

### Rollback Strategy

1. **Feature Flags**: All migrations behind flags
2. **Gradual Rollout**: 1% → 10% → 50% → 100%
3. **Monitoring**: Error rates, performance, user feedback
4. **Rollback Plan**: Immediate revert capability

---

## Success Metrics

### Phase Completion Criteria

| Phase | Target | Metric |
|-------|--------|--------|
| Phase 1 | 25 operations | 100% constitutional |
| Phase 2 | 17 operations | 100% constitutional |
| Phase 3 | 54 operations | 100% constitutional |
| Phase 4 | 65 operations | 100% constitutional |

### Overall Success Criteria

- **161 shadow operations** → **0 shadow operations**
- **84 shadow authorities** → **0 shadow authorities**
- **15.7% compliance** → **100% compliance**
- **0 constitutional violations**

---

*Migration Priority Matrix Generated: 2026-06-05*
*Auditor: Fresh Constitutional Audit System*
