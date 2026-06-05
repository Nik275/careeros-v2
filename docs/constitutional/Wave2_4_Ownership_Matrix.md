# Wave 2.4 — Decision Coalition Engine V3 Ownership Matrix

**Matrix Date:** 2026-06-04  
**Classification:** Constitutional Ownership Analysis  
**Scope:** Complete method ownership classification

---

## Ownership Legend

| Symbol | Owner | Description |
|--------|-------|-------------|
| 🟢 DA | DecisionAuthority | Constitutional owner — must delegate here |
| 🟡 CM | CoalitionModule | Domain-specific — keep in specialized module |
| 🔴 CE | CoalitionEngine | Current owner — must migrate |
| ⚪ N/A | Not Applicable | Utility or helper methods |

---

## Complete Ownership Matrix

### Public Interface

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `constructor()` | 334 | 🔴 CE | 🟡 CM | Initialize CoalitionModule |
| `analyze()` | 352 | 🔴 CE | 🟢 DA | Delegate to DecisionAuthority |

### Path Analysis Methods

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `analyzePath()` | 403 | 🔴 CE | 🟢 DA | Delegate to DecisionAuthority |

### Member Evaluation Methods (Domain-Specific)

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `evaluateStudentInterests()` | 448 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `evaluateStudentValues()` | 513 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `evaluateFamilyExpectations()` | 580 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `evaluateEconomicReality()` | 649 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `evaluateEducationalReality()` | 719 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `evaluateGeographicReality()` | 783 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `evaluateFutureOpportunity()` | 848 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |

### Aggregation Methods

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `calculateAggregateScores()` | 916 | 🔴 CE | 🟢 DA | Use DecisionAggregator |
| `analyzeDynamics()` | 952 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `calculateCoalitionHealth()` | 1290 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |

### Conflict & Resolution Methods

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `identifyMemberConflicts()` | 985 | 🔴 CE | 🟡 CM | Keep in CoalitionModule |
| `suggestResolutionStrategies()` | 1043 | 🔴 CE | 🟢 DA | Delegate to ArbitrationAuthority |

### Explanation Methods

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `generateExplanation()` | 1080 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |
| `generateSummary()` | 1130 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |
| `generateDetails()` | 1167 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |
| `generateReasoning()` | 1206 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |
| `generateNegotiations()` | 1248 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |
| `generateAlternativeConsiderations()` | 1277 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |

### Comparison Methods

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `comparePaths()` | 1313 | 🔴 CE | 🟢 DA | Delegate to ComparisonAuthority |
| `generatePathComparisonText()` | 1343 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |
| `identifyPathTradeoffs()` | 1369 | 🔴 CE | 🟢 DA | Delegate to ComparisonAuthority |

### Recommendation Methods

| Method | Line | Current | Target | Migration Action |
|--------|------|---------|--------|------------------|
| `generateRecommendation()` | 1391 | 🔴 CE | 🟢 DA | Delegate to SelectionAuthority |
| `generateSuccessConditions()` | 1413 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |
| `generateRiskMitigation()` | 1438 | 🔴 CE | 🟢 DA | Delegate to ExplanationAuthority |

---

## Ownership Distribution

### Current State

| Owner | Methods | Percentage |
|-------|---------|------------|
| 🔴 CoalitionEngine | 29 | 100% |
| 🟢 DecisionAuthority | 0 | 0% |
| 🟡 CoalitionModule | 0 | 0% |

### Target State

| Owner | Methods | Percentage |
|-------|---------|------------|
| 🔴 CoalitionEngine | 0 | 0% |
| 🟢 DecisionAuthority | 16 | 55% |
| 🟡 CoalitionModule | 12 | 41% |
| ⚪ Factory Functions | 1 | 4% |

---

## Constitutional Migration Path

### Step 1: Create CoalitionModule (Internal Authority)

**Responsibilities:**
- 7 member evaluation methods
- 2 coalition dynamics methods
- 1 coalition health method
- 1 conflict identification method

**Total:** 11 methods → CoalitionModule

### Step 2: Extend DecisionAuthority

**New Methods:**
```typescript
// Coalition-aware decision methods
analyzeCoalition(input: CoalitionAnalysisInput): Promise<CoalitionDecisionResult>
compareCoalitionPaths(pathA: PathCoalitionAnalysis, pathB: PathCoalitionAnalysis): CoalitionPathComparison
selectCoalitionRecommendation(rankedPaths: PathCoalitionAnalysis[]): CoalitionRecommendation
explainCoalitionDecision(analysis: CoalitionDecisionResult): CoalitionExplanation
arbitrateCoalitionConflicts(conflicts: MemberConflict[]): ConflictResolution
```

### Step 3: DecisionCoalitionEngineV3 Becomes Consumer

```typescript
// Before (Current)
class DecisionCoalitionEngineV3 {
  analyze(): DecisionCoalitionAnalysis {
    // 1,514 lines of decision logic
  }
}

// After (Constitutional)
class DecisionCoalitionEngineV3 {
  private authority: IDecisionAuthority;
  
  async analyze(): Promise<CoalitionDecisionResult> {
    return this.authority.analyzeCoalition(input);
  }
}
```

---

## Authority Specialization Strategy

### DecisionAuthority (Orchestrator)

```
DecisionAuthority
├── analyzeCoalition() [NEW]
│   ├── CoalitionModule.evaluateMembers() [Domain-specific]
│   ├── RankingAuthority.rankByStability() [Generic]
│   ├── ComparisonAuthority.compareByCoalition() [Generic]
│   ├── SelectionAuthority.selectTop() [Generic]
│   └── ExplanationAuthority.explainCoalition() [Generic]
├── compareCoalitionPaths() [NEW]
└── explainCoalitionDecision() [NEW]
```

### CoalitionModule (Domain Authority)

```
CoalitionModule (Internal Specialization)
├── evaluateStudentInterests() [Domain Expertise]
├── evaluateStudentValues() [Domain Expertise]
├── evaluateFamilyExpectations() [Domain Expertise]
├── evaluateEconomicReality() [Domain Expertise]
├── evaluateEducationalReality() [Domain Expertise]
├── evaluateGeographicReality() [Domain Expertise]
├── evaluateFutureOpportunity() [Domain Expertise]
├── analyzeDynamics() [Coalition Logic]
├── identifyMemberConflicts() [Conflict Logic]
└── calculateCoalitionHealth() [Aggregate Logic]
```

---

## Migration Complexity by Method

| Complexity | Methods | Count | Effort |
|------------|---------|-------|--------|
| **Low** | Simple delegation wrappers | 8 | 1-2 days |
| **Medium** | Generic logic extraction | 10 | 2-3 days |
| **High** | Domain logic preservation | 11 | 3-4 days |
| **Total** | All methods | 29 | 6-9 days |

### Low Complexity (Simple Delegation)

- `comparePaths()` → `authority.compare()`
- `generateRecommendation()` → `authority.selectTop()`
- `generateExplanation()` → `authority.explain()`
- `generateSummary()` → `authority.explain({detail: 'low'})`
- `generateDetails()` → `authority.explain({detail: 'high'})`
- `generateReasoning()` → `authority.explain({includeReasoning: true})`
- `generateNegotiations()` → `authority.explain({includeRecommendations: true})`
- `generateAlternativeConsiderations()` → `authority.explain({includeAlternatives: true})`

### Medium Complexity (Generic Logic Extraction)

- `calculateAggregateScores()` → Extract weighted aggregation pattern
- `generatePathComparisonText()` → Move to ExplanationAuthority
- `identifyPathTradeoffs()` → Move to ComparisonAuthority
- `generateSuccessConditions()` → Move to ExplanationAuthority
- `generateRiskMitigation()` → Move to ExplanationAuthority
- `suggestResolutionStrategies()` → Move to ArbitrationAuthority
- `analyzePath()` → Orchestrate via DecisionAuthority
- `calculateCoalitionHealth()` → Standardize aggregation pattern
- `analyze()` → Main orchestration method
- `analyzeDynamics()` → Refine for module interface

### High Complexity (Domain Logic Preservation)

All 7 member evaluation methods:
- `evaluateStudentInterests()`
- `evaluateStudentValues()`
- `evaluateFamilyExpectations()`
- `evaluateEconomicReality()`
- `evaluateEducationalReality()`
- `evaluateGeographicReality()`
- `evaluateFutureOpportunity()`

Plus:
- `identifyMemberConflicts()` — Complex conflict detection logic
- `calculateCoalitionHealth()` — Multi-factor health calculation

---

## Summary

**Total Methods:** 29  
**To DecisionAuthority:** 16 (55%)  
**To CoalitionModule:** 12 (41%)  
**To Factory:** 1 (4%)  

**Constitutional Ownership Achieved:** 100% of generic decision logic  
**Domain Expertise Preserved:** 100% of coalition-specific logic  
**Migration Feasibility:** HIGH (proven Wave 1/2 pattern)

---

**Matrix Completed:** 2026-06-04  
**Status:** APPROVED FOR MIGRATION
