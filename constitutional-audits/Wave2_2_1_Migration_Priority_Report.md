# Wave 2.2.1 — Migration Priority Report

**Date:** 2026-06-04  
**Program:** CareerOS Constitutional Consolidation  
**Wave:** 2.2.1 — Decision Ownership Ranking  
**Status:** COMPLETE  

---

## Executive Summary

Based on the comprehensive decision ownership audit, this report establishes the **optimal migration sequence** for Wave 2.

### Key Recommendation

**Wave 2.3 Target: MetaDecisionEngine**

**Rationale:**
- Highest ownership score (92)
- Architectural centrality (top of decision hierarchy)
- Largest compliance gain (+12%)
- Proven migration pattern (similar to Wave 2.2)

---

## Priority Matrix

### P0 — Critical (Immediate Migration Required)

| Rank | Engine | Ownership Score | Compliance Gain | Risk | Timeline |
|------|--------|-----------------|-----------------|------|----------|
| 1 | **MetaDecisionEngine** | 92 | +12% | High | 10-15 days |
| 2 | **DecisionCoalitionEngineV3** | 87 | +10% | High | 7-10 days |
| 3 | **DecisionIntelligenceEngine** | 78 | +8% | Medium | 5-7 days |

**Total P0 Impact:** +30% compliance, 3 engines, 22-32 days

### P1 — High (Next Priority Wave)

| Rank | Engine | Ownership Score | Compliance Gain | Risk | Timeline |
|------|--------|-----------------|-----------------|------|----------|
| 4 | DecisionIntelligenceEngineV1 | 76 | +7% | Low | 4-5 days |
| 5 | DecisionOptimizationEngineV1 | 71 | +6% | Medium | 4-5 days |
| 6 | MarketAwareDecisionEngine | 65 | +5% | Low | 3-4 days |

**Total P1 Impact:** +18% compliance, 3 engines, 11-14 days

### P2 — Medium (Supporting Engines)

| Rank | Engine | Ownership Score | Compliance Gain | Risk | Timeline |
|------|--------|-----------------|-----------------|------|----------|
| 7 | DecisionTreeEngine | 58 | +5% | Low | 3-4 days |
| 8 | DecisionBoundaryEngine | 62 | +4% | Low | 2-3 days |
| 9 | DecisionContextOrchestrator | 58 | +4% | Low | 2-3 days |

**Total P2 Impact:** +13% compliance, 3 engines, 7-10 days

### P3 — Low (Final Cleanup)

| Rank | Engine | Ownership Score | Compliance Gain | Risk | Timeline |
|------|--------|-----------------|-----------------|------|----------|
| 10 | DecisionCalibrationEngine | 55 | +3% | Low | 2 days |
| 11 | DecisionCoalitionEngine | 52 | +3% | Low | 2 days |
| 12-18 | [Supporting Engines] | <50 | +2% each | Low | 1-2 days each |

**Total P3 Impact:** +15% compliance, 12+ engines, 15-20 days

---

## Wave Allocation

### Proposed Wave Schedule

| Wave | Targets | Duration | Compliance Target | Cumulative |
|------|---------|----------|-------------------|------------|
| 2.1 | Infrastructure | 1 week | 8.2% | 8.2% |
| 2.2 | DecisionComparisonEngine | 1 week | 15.4% | 15.4% |
| **2.3** | **MetaDecisionEngine** | **2 weeks** | **27.4%** | **27.4%** |
| 2.4 | DecisionCoalitionEngineV3 + DIEngine | 2 weeks | 45.4% | 45.4% |
| 2.5 | Optimization + Market + Tree | 2 weeks | 61.4% | 61.4% |
| 2.6 | Boundary + Context + Calibration | 2 weeks | 72.4% | 72.4% |
| 2.7 | Supporting engines | 2 weeks | 82.4% | 82.4% |
| 2.8 | Final cleanup + certification | 1 week | 90.0% | 90.0% |

**Total Wave 2 Duration:** ~13 weeks  
**Final Compliance Target:** 90%  

---

## Risk-Adjusted Priority

### High-Risk Migrations (Requires Careful Planning)

| Engine | Risk Factors | Mitigation Strategy |
|--------|--------------|---------------------|
| **MetaDecisionEngine** | 7 sub-engines, complex orchestration, high consumer count | Migrate sub-engines incrementally; extensive testing |
| **DecisionCoalitionEngineV3** | Multi-stakeholder logic, voting systems, stakeholder modeling | Create new arbitration strategies in authority; stakeholder framework |
| **DecisionIntelligenceEngine** | Core recommendation path, 15+ consumers, coordinates 7 sub-engines | Phased migration; maintain V1 compatibility during transition |

### Medium-Risk Migrations (Standard Pattern)

| Engine | Risk Factors | Mitigation Strategy |
|--------|--------------|---------------------|
| DecisionOptimizationEngineV1 | Mathematical optimization algorithms | Preserve optimization logic; wrap with authority |
| DecisionIntelligenceEngineV1 | Legacy compatibility requirements | Parallel V1/V2 support during migration |

### Low-Risk Migrations (Straightforward)

All remaining engines have:
- Clear boundaries
- Low consumer counts
- Self-contained logic
- Standard delegation patterns

---

## Dependency Analysis

### Critical Path

```
Wave 2.3: MetaDecisionEngine
    ↓ (depends on)
Wave 2.4: DecisionIntelligenceEngine
    ↓ (depends on)
Wave 2.5: DecisionTreeEngine, MarketAwareDecisionEngine
    ↓ (depends on)
Wave 2.6: Supporting engines
    ↓ (depends on)
Wave 2.7: Final cleanup
```

### Parallel Migration Opportunities

**Can Run in Parallel:**
- DecisionCalibrationEngine (independent)
- DecisionBoundaryEngine (independent)
- MarketAwareDecisionEngine (independent)
- Most supporting engines (independent)

**Must Run Sequentially:**
- MetaDecisionEngine → DecisionIntelligenceEngine (consumer dependency)
- DecisionCoalitionEngineV3 → DecisionCoalitionEngine (legacy cleanup)

---

## Resource Allocation

### Engineering Resources

| Wave | Engineers | Duration | Total Effort |
|------|-----------|----------|--------------|
| 2.3 | 2 senior | 2 weeks | 4 person-weeks |
| 2.4 | 2 senior | 2 weeks | 4 person-weeks |
| 2.5 | 1 senior, 1 mid | 2 weeks | 4 person-weeks |
| 2.6 | 1 senior, 1 mid | 2 weeks | 4 person-weeks |
| 2.7 | 2 mid | 2 weeks | 4 person-weeks |
| 2.8 | 1 senior | 1 week | 1 person-week |

**Total Effort:** ~21 person-weeks

### Testing Resources

Each wave requires:
- Unit testing: 20% of migration time
- Integration testing: 15% of migration time
- Behavioral parity testing: 25% of migration time
- Performance testing: 10% of migration time

**Testing Overhead:** ~70% of development time

---

## Success Metrics by Wave

### Wave 2.3 Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| MetaDecisionEngine migrated | 100% | Code review |
| 7 sub-engines migrated | 100% | Code review |
| Behavioral parity | ≥99% | Test results |
| No consumer breakage | 0 incidents | Monitoring |
| Performance overhead | <10% | Benchmarks |
| Compliance gain | +12% | Enforcement script |

### Wave 2.4 Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| DecisionCoalitionEngineV3 migrated | 100% | Code review |
| DecisionIntelligenceEngine migrated | 100% | Code review |
| Stakeholder voting in authority | Complete | Feature testing |
| Behavioral parity | ≥99% | Test results |
| Compliance gain | +18% | Enforcement script |

---

## Recommendation Summary

### Immediate Action (Next 2 Weeks)

**Begin Wave 2.3: MetaDecisionEngine Migration**

1. **Week 1:**
   - Day 1-2: Detailed audit of MetaDecisionEngine + 7 sub-engines
   - Day 3-4: Design authority extensions for meta-decision capabilities
   - Day 5: Create conversion utilities and test framework

2. **Week 2:**
   - Day 1-3: Implement delegation layer
   - Day 4-5: Testing and validation

### Success Probability

| Engine | Confidence | Key Success Factors |
|--------|-----------|---------------------|
| MetaDecisionEngine | 85% | Proven Wave 2.2 pattern, clear boundaries |
| DecisionCoalitionEngineV3 | 75% | Complex stakeholder logic, new authority capabilities |
| DecisionIntelligenceEngine | 80% | Well-structured, established interfaces |

### Risk Mitigation

**Primary Risks:**
1. **Complex orchestration in MetaDecisionEngine**
   - Mitigation: Incremental sub-engine migration
   
2. **Consumer breakage during migration**
   - Mitigation: Full API compatibility, deprecation warnings
   
3. **Performance regression**
   - Mitigation: Benchmarking, optimization post-migration

---

## Conclusion

### Key Takeaways

1. **MetaDecisionEngine is the clear Wave 2.3 target**
   - Highest ownership score
   - Largest compliance impact
   - Architectural centrality

2. **Wave 2 will require ~13 weeks total**
   - 8 migration waves
   - 21 person-weeks of effort
   - 90% final compliance target

3. **Risk is manageable with proven pattern**
   - Wave 2.2 established successful delegation approach
   - Incremental migration reduces risk
   - Extensive testing ensures parity

### Next Steps

1. ✅ Audit complete (Wave 2.2.1)
2. 🔄 Approve Wave 2.3 target (MetaDecisionEngine)
3. ⏳ Begin Wave 2.3 planning
4. ⏳ Allocate engineering resources
5. ⏳ Execute migration

---

**END OF MIGRATION PRIORITY REPORT**

**Status:** Complete  
**Recommendation:** MetaDecisionEngine for Wave 2.3  
**Confidence:** High  
**Timeline:** 13 weeks for full Wave 2 completion  

---

*This priority report provides the roadmap for completing the constitutional consolidation of decision-making in CareerOS.*
