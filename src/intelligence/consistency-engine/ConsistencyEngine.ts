/**
 * CareerOS Intelligence Consistency Engine
 *
 * Validates consistency across all intelligence layers.
 *
 * Purpose:
 *   - Detect contradictions between engine outputs
 *   - Identify agreement and consensus
 *   - Find weak reasoning chains
 *   - Detect overriding influences
 *   - Resolve engine conflicts
 *
 * Architecture Principles:
 *   - Deterministic: Same input always produces same output
 *   - Explainable: Every detection includes reasoning
 *   - Type-safe: Full TypeScript coverage
 *   - Configurable: Rules and thresholds can be customized
 *   - Production-ready: Robust error handling and validation
 *
 * Consistency Score (0-100):
 *   90-100 = Excellent (strong cross-engine agreement)
 *   70-89  = Good (minor inconsistencies)
 *   50-69  = Fair (some concerns need attention)
 *   30-49  = Poor (significant conflicts)
 *   0-29   = Critical (major contradictions)
 */

import type {
  ConsistencyId,
  ConsistencyViolation,
  ViolationSeverity,
  ConsistencyType,
  EngineSource,
  IntelligenceResults,
  ConflictingValue,
  ResolutionRecommendation,
  EngineAgreement,
  ReasoningGraph,
  ReasoningNode,
  ReasoningEdge,
  WeakReasoningChain,
  ReasoningStep,
  OverrideDetection,
  EngineConflict,
  ConsistencyReport,
  ConsistencyInterpretation,
  TopRecommendation,
  ConsistencyStatistics,
  ConsistencyRule,
  ConsistencyEngineConfig,
  ConsistencyAnalysisOptions,
} from './types';

import {
  validateInput,
  calculateValueDistance,
  detectDirectionalConflict,
  normalizeScore,
  weightedAverage,
} from './utils';

// ============================================================================
// CORE ENGINE
// ============================================================================

/**
 * ConsistencyEngine validates intelligence output consistency.
 */
export class ConsistencyEngine {
  private config: ConsistencyEngineConfig;
  private rules: ConsistencyRule[];

  constructor(config: Partial<ConsistencyEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONSISTENCY_CONFIG, ...config };
    this.rules = [...BUILT_IN_RULES, ...this.config.rules.customRules];
    this.applyRuleOverrides();
  }

  /**
   * Update configuration.
   */
  configure(config: Partial<ConsistencyEngineConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.rules?.customRules) {
      this.rules = [...BUILT_IN_RULES, ...config.rules.customRules];
      this.applyRuleOverrides();
    }
  }

  /**
   * Main entry point: validate consistency across all intelligence results.
   */
  validate(results: IntelligenceResults, options: ConsistencyAnalysisOptions = {}): ConsistencyReport {
    const id = this.generateId();

    // Validate input
    const validation = validateInput(results);
    if (!validation.valid) {
      return this.createErrorReport(id, validation.error!);
    }

    // Apply options filters
    const filteredResults = this.applyFilters(results, options);

    // Detect all consistency aspects
    const violations: ConsistencyViolation[] = [];
    const agreements: EngineAgreement[] = [];
    const weakChains: WeakReasoningChain[] = [];
    const overrides: OverrideDetection[] = [];
    const conflicts: EngineConflict[] = [];

    if (this.config.enableContradictionDetection) {
      violations.push(...this.detectContradictions(filteredResults));
    }

    if (this.config.enableAgreementDetection) {
      agreements.push(...this.detectAgreements(filteredResults));
    }

    if (this.config.enableWeakChainDetection) {
      weakChains.push(...this.detectWeakChains(filteredResults));
    }

    if (this.config.enableOverrideDetection) {
      overrides.push(...this.detectOverrides(filteredResults));
    }

    if (this.config.enableConflictDetection) {
      conflicts.push(...this.detectConflicts(filteredResults));
    }

    // Apply rules
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      const violation = rule.validate(filteredResults);
      if (violation) {
        violations.push(violation);
      }
    }

    // Build reasoning graph
    const reasoningGraph = this.buildReasoningGraph(filteredResults, violations, agreements);

    // Calculate scores
    const consistencyScore = this.calculateConsistencyScore(
      violations,
      agreements,
      conflicts,
      filteredResults
    );

    const engineReliability = this.calculateEngineReliability(violations, agreements);

    // Generate top recommendation
    const topRecommendation = this.generateTopRecommendation(
      filteredResults,
      agreements,
      conflicts,
      engineReliability
    );

    // Calculate statistics
    const statistics = this.calculateStatistics(
      violations,
      agreements,
      weakChains,
      conflicts,
      filteredResults,
      engineReliability
    );

    // Filter by severity if requested
    const filteredViolations = options.minSeverity
      ? violations.filter(v => this.severityRank(v.severity) >= this.severityRank(options.minSeverity!))
      : violations;

    const finalViolations = options.maxViolations
      ? filteredViolations.slice(0, options.maxViolations)
      : filteredViolations;

    return {
      id,
      timestamp: Date.now(),
      consistencyScore,
      interpretation: this.interpretScore(consistencyScore, finalViolations, agreements),
      violations: finalViolations,
      agreements,
      weakChains,
      overrides,
      conflicts,
      reasoningGraph,
      engineReliability,
      topRecommendation,
      statistics,
    };
  }

  /**
   * Quick consistency check: returns true if results are sufficiently consistent.
   */
  isConsistent(results: IntelligenceResults, threshold = 70): boolean {
    const report = this.validate(results);
    return report.consistencyScore >= threshold;
  }

  /**
   * Get the most critical violations.
   */
  getCriticalViolations(results: IntelligenceResults, limit = 5): ConsistencyViolation[] {
    const report = this.validate(results);
    return report.violations
      .filter(v => v.severity === 'critical' || v.severity === 'high')
      .slice(0, limit);
  }

  /**
   * Find agreements for a specific path.
   */
  getPathAgreements(results: IntelligenceResults, pathId: string): EngineAgreement[] {
    const report = this.validate(results, { targetPathId: pathId });
    return report.agreements.filter(a => a.targetId === pathId);
  }

  // ============================================================================
  // CONTRADICTION DETECTION
  // ============================================================================

  private detectContradictions(results: IntelligenceResults): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // Check matching vs coalition alignment
    const matchingCoalitionContradiction = this.checkMatchingCoalitionContradiction(results);
    if (matchingCoalitionContradiction) {
      violations.push(matchingCoalitionContradiction);
    }

    // Check optionality vs criticality (inverse relationship)
    const optionalityCriticalityContradiction = this.checkOptionalityCriticalityContradiction(results);
    if (optionalityCriticalityContradiction) {
      violations.push(optionalityCriticalityContradiction);
    }

    // Check regret vs recommendation confidence
    const regretRecommendationContradiction = this.checkRegretRecommendationContradiction(results);
    if (regretRecommendationContradiction) {
      violations.push(regretRecommendationContradiction);
    }

    // Check market vs future simulation
    const marketFutureContradiction = this.checkMarketFutureContradiction(results);
    if (marketFutureContradiction) {
      violations.push(marketFutureContradiction);
    }

    return violations;
  }

  private checkMatchingCoalitionContradiction(results: IntelligenceResults): ConsistencyViolation | null {
    if (!results.matching || !results.coalition) return null;

    const topMatch = results.matching.matches[0];
    if (!topMatch) return null;

    // Get first path from coalition analysis
    const pathAnalyses = results.coalition.pathAnalyses;
    const firstPath = pathAnalyses instanceof Map 
      ? Array.from(pathAnalyses.values())[0]
      : Array.isArray(pathAnalyses) ? pathAnalyses[0] : undefined;
    
    if (!firstPath) return null;

    const matchScore = topMatch.score || 0;
    const coalitionScore = (firstPath.aggregate?.alignmentScore || 0) / 100;

    // High match but low coalition alignment is a contradiction
    if (matchScore > 0.8 && coalitionScore < 0.5) {
      return {
        id: `contradiction-matching-coalition-${topMatch.careerId}`,
        type: 'contradiction',
        severity: 'high',
        involvedEngines: ['matching', 'coalition'],
        description: `High matching score (${(matchScore * 100).toFixed(0)}%) but low coalition alignment (${(coalitionScore * 100).toFixed(0)}%)`,
        explanation: `The matching engine strongly recommends this career, but the coalition analysis shows poor stakeholder alignment. This suggests family/social factors may override personal fit.`,
        conflictingValues: [
          { engine: 'matching', attribute: 'score', value: matchScore, confidence: 0.85 },
          { engine: 'coalition', attribute: 'alignmentScore', value: coalitionScore, confidence: 0.8 },
        ],
        targetId: topMatch.careerId,
        resolution: {
          action: 'Investigate family/social constraints or explore compromise careers',
          reasoning: 'Personal fit is strong but external factors are misaligned',
          priority: 1,
          expectedImpact: 15,
        },
        detectionConfidence: 0.85,
      };
    }

    return null;
  }

  private checkOptionalityCriticalityContradiction(results: IntelligenceResults): ConsistencyViolation | null {
    const optionality = Array.isArray(results.optionality)
      ? results.optionality[0]
      : results.optionality;
    const criticality = Array.isArray(results.criticality)
      ? results.criticality[0]
      : results.criticality;

    if (!optionality || !criticality) return null;

    const optionalityScore = (optionality.overallScore || 0) / 100;
    const criticalityScore = (criticality.criticalityScore || 0) / 100;

    // High optionality should correlate with low criticality
    // If optionality is high but criticality is also high, that's a contradiction
    if (optionalityScore > 0.7 && criticalityScore > 0.7) {
      return {
        id: `contradiction-optionality-criticality`,
        type: 'contradiction',
        severity: 'medium',
        involvedEngines: ['optionality', 'criticality'],
        description: `Both optionality (${(optionalityScore * 100).toFixed(0)}%) and criticality (${(criticalityScore * 100).toFixed(0)}%) are high`,
        explanation: `High optionality (many future paths) should correlate with low criticality (low constraint). Both being high suggests an inconsistency in the analysis.`,
        conflictingValues: [
          { engine: 'optionality', attribute: 'overallScore', value: optionalityScore, confidence: 0.8 },
          { engine: 'criticality', attribute: 'criticalityScore', value: criticalityScore, confidence: 0.8 },
        ],
        targetId: optionality.careerId || criticality.careerId,
        resolution: {
          action: 'Review career transition graph data for accuracy',
          reasoning: 'The inverse relationship between optionality and criticality is being violated',
          priority: 2,
          expectedImpact: 10,
        },
        detectionConfidence: 0.75,
      };
    }

    return null;
  }

  private checkRegretRecommendationContradiction(results: IntelligenceResults): ConsistencyViolation | null {
    if (!results.regret || !results.recommendations || results.recommendations.length === 0) {
      return null;
    }

    const topRecommendation = results.recommendations[0];
    const pathId = topRecommendation.path.id;

    // Find regret analysis for this path
    const pathAnalyses = results.regret.pathAnalyses;
    const pathRegret = pathAnalyses instanceof Map
      ? pathAnalyses.get(pathId)
      : Array.isArray(pathAnalyses)
        ? pathAnalyses.find((p: { pathId: string }) => p.pathId === pathId)
        : undefined;
    
    if (!pathRegret) return null;

    const regretRisk = (pathRegret.aggregate?.overallRegretScore || 0) / 100;

    // High recommendation confidence but high regret risk is a contradiction
    if (topRecommendation.confidence > 0.8 && regretRisk > 0.6) {
      return {
        id: `contradiction-regret-recommendation-${pathId}`,
        type: 'contradiction',
        severity: 'high',
        involvedEngines: ['recommendation', 'regret'],
        description: `High recommendation confidence (${(topRecommendation.confidence * 100).toFixed(0)}%) but significant regret risk (${(regretRisk * 100).toFixed(0)}%)`,
        explanation: `The recommendation engine strongly suggests this path, but regret analysis predicts high likelihood of future dissatisfaction.`,
        conflictingValues: [
          { engine: 'recommendation', attribute: 'confidence', value: topRecommendation.confidence, confidence: topRecommendation.confidence },
          { engine: 'regret', attribute: 'regretRisk', value: regretRisk, confidence: pathRegret.aggregate?.overallConfidence || 0.75 },
        ],
        targetId: pathId,
        resolution: {
          action: 'Investigate specific regret factors and consider alternative paths',
          reasoning: 'Strong recommendation conflicts with predicted future regret',
          priority: 1,
          expectedImpact: 20,
        },
        detectionConfidence: 0.8,
      };
    }

    return null;
  }

  private checkMarketFutureContradiction(results: IntelligenceResults): ConsistencyViolation | null {
    if (!results.market || !results.futureSimulation) return null;

    // Map trend type to numeric direction
    const trendToDirection = (trendType: string): number => {
      switch (trendType) {
        case 'growing':
        case 'emerging':
          return 1;
        case 'declining':
          return -1;
        case 'stable':
        default:
          return 0;
      }
    };

    const marketTrend = results.market.trend;
    const marketDemand = trendToDirection(marketTrend?.trendType || 'stable') * (marketTrend?.strength || 0);
    
    const scenario = results.futureSimulation.scenarios?.[0];
    const futureDemand = scenario?.assumptions?.marketConditions === 'boom' || scenario?.assumptions?.marketConditions === 'growth' ? 1 :
                         scenario?.assumptions?.marketConditions === 'recession' || scenario?.assumptions?.marketConditions === 'slow' ? -1 : 0;

    // Market says declining but future simulation says growing (or vice versa)
    const marketDirection = marketDemand > 0.3 ? 'growing' : marketDemand < -0.3 ? 'declining' : 'stable';
    const futureDirection = futureDemand > 0 ? 'growing' : futureDemand < 0 ? 'declining' : 'stable';

    if (marketDirection !== futureDirection && marketDirection !== 'stable' && futureDirection !== 'stable') {
      return {
        id: `contradiction-market-future`,
        type: 'contradiction',
        severity: 'medium',
        involvedEngines: ['market', 'future_simulation'],
        description: `Market signals show ${marketDirection} demand but future simulation shows ${futureDirection} projection`,
        explanation: `Current market intelligence and future scenario modeling disagree on demand trajectory.`,
        conflictingValues: [
          { engine: 'market', attribute: 'trendType', value: marketTrend?.trendType || 'unknown', confidence: marketTrend?.confidence || 0.7 },
          { engine: 'future_simulation', attribute: 'marketConditions', value: scenario?.assumptions?.marketConditions || 'unknown', confidence: 0.7 },
        ],
        resolution: {
          action: 'Review data sources and time horizons for both analyses',
          reasoning: 'Market signal and simulation use different methodologies that should align',
          priority: 2,
          expectedImpact: 12,
        },
        detectionConfidence: 0.7,
      };
    }

    return null;
  }

  // ============================================================================
  // AGREEMENT DETECTION
  // ============================================================================

  private detectAgreements(results: IntelligenceResults): EngineAgreement[] {
    const agreements: EngineAgreement[] = [];

    // Check for consensus on top paths
    const pathConsensus = this.detectPathConsensus(results);
    agreements.push(...pathConsensus);

    // Check for value alignment consensus
    const valueConsensus = this.detectValueConsensus(results);
    agreements.push(...valueConsensus);

    // Check for feasibility consensus
    const feasibilityConsensus = this.detectFeasibilityConsensus(results);
    agreements.push(...feasibilityConsensus);

    return agreements;
  }

  private detectPathConsensus(results: IntelligenceResults): EngineAgreement[] {
    const agreements: EngineAgreement[] = [];

    // Collect top paths from each engine
    const engineTopPaths: Record<string, string[]> = {
      matching: results.matching?.matches?.slice(0, 3).map((m: { careerId: string }) => m.careerId) || [],
      utility: [],
      optionality: [],
      criticality: [],
      coalition: [],
      regret: [],
      market: [],
      future_simulation: [],
      recommendation: results.recommendations?.slice(0, 3).map((r: { path: { id: string } }) => r.path.id) || [],
    };

    // Get coalition top paths
    if (results.coalition?.pathAnalyses) {
      const analyses = results.coalition.pathAnalyses instanceof Map
        ? Array.from(results.coalition.pathAnalyses.values())
        : Array.isArray(results.coalition.pathAnalyses) ? results.coalition.pathAnalyses : [];
      engineTopPaths.coalition = analyses.slice(0, 3).map((p: { pathId: string }) => p.pathId);
    }

    // Get regret top paths
    if (results.regret?.pathAnalyses) {
      const analyses = results.regret.pathAnalyses instanceof Map
        ? Array.from(results.regret.pathAnalyses.values())
        : Array.isArray(results.regret.pathAnalyses) ? results.regret.pathAnalyses : [];
      engineTopPaths.regret = analyses.slice(0, 3).map((p: { pathId: string }) => p.pathId);
    }

    // Find paths that appear in multiple engines' top 3
    const pathCount: Record<string, { count: number; engines: EngineSource[]; scores: number[] }> = {};

    for (const [engine, paths] of Object.entries(engineTopPaths)) {
      for (let i = 0; i < paths.length; i++) {
        const pathId = paths[i];
        if (!pathCount[pathId]) {
          pathCount[pathId] = { count: 0, engines: [], scores: [] };
        }
        pathCount[pathId].count++;
        pathCount[pathId].engines.push(engine as EngineSource);
        pathCount[pathId].scores.push(1 - i * 0.2); // Higher score for higher rank
      }
    }

    // Create agreements for paths with consensus
    for (const [pathId, data] of Object.entries(pathCount)) {
      if (data.count >= 3) {
        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        agreements.push({
          id: `agreement-path-${pathId}`,
          engines: data.engines,
          subject: `Top career path recommendation`,
          agreedValue: pathId,
          strength: Math.min(avgScore + 0.2, 1),
          engineConfidences: this.getEngineConfidencesForPath(results, pathId, data.engines),
          explanation: `${data.count} engines independently identify this path as a top recommendation`,
          targetId: pathId,
        });
      }
    }

    return agreements;
  }

  private detectValueConsensus(results: IntelligenceResults): EngineAgreement[] {
    const agreements: EngineAgreement[] = [];

    if (!results.matching || !results.coalition) return agreements;

    // Check if value satisfaction is consistent across engines
    const matchingValues = results.matching.matches[0]?.explanation?.motivationFit?.score || 0;
    
    const pathAnalyses = results.coalition.pathAnalyses;
    const firstPath = pathAnalyses instanceof Map 
      ? Array.from(pathAnalyses.values())[0]
      : Array.isArray(pathAnalyses) ? pathAnalyses[0] : undefined;
    
    const coalitionValues = (firstPath?.aggregate?.alignmentScore || 0) / 100;

    const difference = Math.abs(matchingValues - coalitionValues);
    if (difference < 0.15 && matchingValues > 0.6) {
      agreements.push({
        id: `agreement-values`,
        engines: ['matching', 'coalition'],
        subject: 'Value satisfaction alignment',
        agreedValue: (matchingValues + coalitionValues) / 2,
        strength: 1 - difference,
        engineConfidences: {
          matching: 0.85,
          coalition: results.coalition.coalitionHealth?.confidence || 0.7,
        },
        explanation: 'Multiple engines confirm strong value alignment for top recommendation',
        targetId: results.matching.matches[0]?.careerId,
      });
    }

    return agreements;
  }

  private detectFeasibilityConsensus(results: IntelligenceResults): EngineAgreement[] {
    const agreements: EngineAgreement[] = [];

    // Check feasibility alignment between criticality and coalition
    const criticality = Array.isArray(results.criticality)
      ? results.criticality[0]
      : results.criticality;

    if (criticality && results.coalition) {
      // Low criticality + high feasibility = agreement
      const criticalityFeasibility = 1 - ((criticality.criticalityScore || 0) / 100);
      
      const pathAnalyses = results.coalition.pathAnalyses;
      const firstPath = pathAnalyses instanceof Map 
        ? Array.from(pathAnalyses.values())[0]
        : Array.isArray(pathAnalyses) ? pathAnalyses[0] : undefined;
      
      const coalitionFeasibility = (firstPath?.aggregate?.stabilityScore || 0) / 100;

      const difference = Math.abs(criticalityFeasibility - coalitionFeasibility);
      if (difference < 0.2 && criticalityFeasibility > 0.6) {
        agreements.push({
          id: `agreement-feasibility`,
          engines: ['criticality', 'coalition'],
          subject: 'Path feasibility',
          agreedValue: (criticalityFeasibility + coalitionFeasibility) / 2,
          strength: 1 - difference,
          engineConfidences: {
            criticality: 0.8,
            coalition: results.coalition.coalitionHealth?.confidence || 0.7,
          },
          explanation: 'Both criticality and coalition analysis confirm feasible path',
          targetId: criticality.careerId,
        });
      }
    }

    return agreements;
  }

  private getEngineConfidencesForPath(
    results: IntelligenceResults,
    pathId: string,
    engines: EngineSource[]
  ): Record<EngineSource, number> {
    const confidences: Partial<Record<EngineSource, number>> = {};

    for (const engine of engines) {
      switch (engine) {
        case 'matching':
          const match = results.matching?.matches?.find((m: { careerId: string }) => m.careerId === pathId);
          confidences[engine] = 0.85;
          break;
        case 'coalition':
          const coalition = results.coalition?.pathAnalyses instanceof Map
            ? results.coalition.pathAnalyses.get(pathId)
            : results.coalition?.pathAnalyses?.find((p: { pathId: string }) => p.pathId === pathId);
          confidences[engine] = coalition?.aggregate?.overallConfidence || 0.7;
          break;
        case 'regret':
          const regret = results.regret?.pathAnalyses instanceof Map
            ? results.regret.pathAnalyses.get(pathId)
            : results.regret?.pathAnalyses?.find((p: { pathId: string }) => p.pathId === pathId);
          confidences[engine] = regret?.aggregate?.overallConfidence || 0.7;
          break;
        case 'recommendation':
          const rec = results.recommendations?.find((r: { path: { id: string } }) => r.path.id === pathId);
          confidences[engine] = rec?.confidence || 0.7;
          break;
        default:
          confidences[engine] = 0.7;
      }
    }

    return confidences as Record<EngineSource, number>;
  }

  // ============================================================================
  // WEAK CHAIN DETECTION
  // ============================================================================

  private detectWeakChains(results: IntelligenceResults): WeakReasoningChain[] {
    const chains: WeakReasoningChain[] = [];

    // Check recommendation reasoning chain
    const recommendationChain = this.checkRecommendationChain(results);
    if (recommendationChain) {
      chains.push(recommendationChain);
    }

    // Check coalition reasoning chain
    const coalitionChain = this.checkCoalitionChain(results);
    if (coalitionChain) {
      chains.push(coalitionChain);
    }

    return chains;
  }

  private checkRecommendationChain(results: IntelligenceResults): WeakReasoningChain | null {
    if (!results.recommendations || results.recommendations.length === 0) return null;

    const topRec = results.recommendations[0];
    const steps: ReasoningStep[] = [];

    // Build reasoning steps from recommendation
    steps.push({
      step: 1,
      premise: 'Student profile analysis',
      conclusion: 'Identified motivations, strengths, and values',
      inferenceRule: 'profile_extraction',
      confidence: topRec.confidence * 0.9,
    });

    steps.push({
      step: 2,
      premise: 'Career matching against profile',
      conclusion: `Matched career ${topRec.path?.nodes?.[0]?.name || 'unknown'}`,
      inferenceRule: 'similarity_matching',
      confidence: topRec.confidence,
    });

    steps.push({
      step: 3,
      premise: 'Path feasibility analysis',
      conclusion: 'Path is feasible given constraints',
      inferenceRule: 'feasibility_check',
      confidence: 0.7,
    });

    steps.push({
      step: 4,
      premise: 'Regret risk assessment',
      conclusion: `Regret risk: ${topRec.reasoning?.regretReasoning || 'unknown'}`,
      inferenceRule: 'regret_prediction',
      confidence: 0.75,
    });

    // Calculate chain strength (weakest link)
    const minConfidence = Math.min(...steps.map(s => s.confidence));
    const weakestStepIndex = steps.findIndex(s => s.confidence === minConfidence);

    if (minConfidence < this.config.rules.thresholds.maxChainWeakness) {
      return {
        id: `weakchain-recommendation-${topRec.id}`,
        startNode: 'student_profile',
        endNode: `recommendation_${topRec.id}`,
        steps,
        chainStrength: minConfidence,
        weakestLink: {
          stepIndex: weakestStepIndex,
          reason: `Step ${weakestStepIndex + 1} has lowest confidence (${(minConfidence * 100).toFixed(0)}%)`,
        },
        improvements: [
          'Gather more assessment data to strengthen profile confidence',
          'Validate career match with external data sources',
          'Collect longitudinal data for better regret prediction',
        ],
      };
    }

    return null;
  }

  private checkCoalitionChain(results: IntelligenceResults): WeakReasoningChain | null {
    if (!results.coalition) return null;

    const steps: ReasoningStep[] = [];

    const pathAnalyses = results.coalition.pathAnalyses;
    const firstPath = pathAnalyses instanceof Map 
      ? Array.from(pathAnalyses.values())[0]
      : Array.isArray(pathAnalyses) ? pathAnalyses[0] : undefined;

    steps.push({
      step: 1,
      premise: 'Stakeholder identification',
      conclusion: `Analyzed coalition dynamics`,
      inferenceRule: 'stakeholder_detection',
      confidence: results.coalition.coalitionHealth?.confidence || 0.7,
    });

    steps.push({
      step: 2,
      premise: 'Member preference evaluation',
      conclusion: 'Evaluated individual member preferences',
      inferenceRule: 'preference_extraction',
      confidence: firstPath ? (firstPath.dynamics?.consensusLevel === 'strong' ? 0.8 : 0.6) : 0.6,
    });

    steps.push({
      step: 3,
      premise: 'Coalition stability calculation',
      conclusion: `Coalition stability: ${firstPath?.aggregate?.stabilityScore || 'unknown'}`,
      inferenceRule: 'stability_analysis',
      confidence: results.coalition.coalitionHealth?.confidence || 0.7,
    });

    const minConfidence = Math.min(...steps.map(s => s.confidence));
    const weakestStepIndex = steps.findIndex(s => s.confidence === minConfidence);

    if (minConfidence < this.config.rules.thresholds.maxChainWeakness) {
      return {
        id: `weakchain-coalition`,
        startNode: 'stakeholder_input',
        endNode: `coalition_analysis`,
        steps,
        chainStrength: minConfidence,
        weakestLink: {
          stepIndex: weakestStepIndex,
          reason: `Step ${weakestStepIndex + 1} has lowest confidence (${(minConfidence * 100).toFixed(0)}%)`,
        },
        improvements: [
          'Conduct structured interviews with stakeholders',
          'Validate stakeholder influence weights',
          'Collect more family context data',
        ],
      };
    }

    return null;
  }

  // ============================================================================
  // OVERRIDE DETECTION
  // ============================================================================

  private detectOverrides(results: IntelligenceResults): OverrideDetection[] {
    const overrides: OverrideDetection[] = [];

    // Check if coalition overrides matching
    const coalitionOverride = this.checkCoalitionOverride(results);
    if (coalitionOverride) {
      overrides.push(coalitionOverride);
    }

    // Check if market overrides future simulation
    const marketOverride = this.checkMarketOverride(results);
    if (marketOverride) {
      overrides.push(marketOverride);
    }

    return overrides;
  }

  private checkCoalitionOverride(results: IntelligenceResults): OverrideDetection | null {
    if (!results.matching || !results.coalition) return null;

    const topMatch = results.matching.matches[0];
    if (!topMatch) return null;

    // Get top coalition path
    const rankedPaths = results.coalition.rankedPaths;
    const topCoalitionPath = Array.isArray(rankedPaths) && rankedPaths.length > 0 
      ? rankedPaths[0] 
      : undefined;
    
    if (!topCoalitionPath) return null;

    // Check if coalition's top pick differs from matching's top pick
    if (topCoalitionPath.pathId !== topMatch.careerId) {
      const coalitionTopScore = (topCoalitionPath.aggregate?.alignmentScore || 0) / 100;
      const matchingTopScore = topMatch.score || 0;

      // Coalition is overriding matching if it has a different top choice with decent alignment
      if (coalitionTopScore > 0.6) {
        return {
          id: `override-coalition-matching`,
          overriddenEngine: 'matching',
          overridingEngine: 'coalition',
          subject: 'Top career recommendation',
          originalValue: topMatch.careerId,
          overriddenValue: topCoalitionPath.pathId,
          justification: `Coalition analysis suggests ${topCoalitionPath.pathId} has better stakeholder alignment (${(coalitionTopScore * 100).toFixed(0)}%) despite lower personal fit`,
          isWarranted: coalitionTopScore > matchingTopScore * 0.8,
        };
      }
    }

    return null;
  }

  private checkMarketOverride(results: IntelligenceResults): OverrideDetection | null {
    if (!results.futureSimulation || !results.market) return null;

    const marketTrend = results.market.trend;
    const marketTrendStrength = marketTrend?.strength || 0;
    const marketTrendType = marketTrend?.trendType || 'stable';
    
    const scenario = results.futureSimulation.scenarios?.[0];
    const simulationMarketCondition = scenario?.assumptions?.marketConditions || 'stable';

    // Map trend type to numeric direction
    const trendToNumeric = (trend: string): number => {
      switch (trend) {
        case 'growing':
        case 'emerging':
          return 1;
        case 'declining':
          return -1;
        default:
          return 0;
      }
    };

    const marketTrendValue = trendToNumeric(marketTrendType) * marketTrendStrength;
    const simulationTrend = simulationMarketCondition === 'boom' || simulationMarketCondition === 'growth' ? 0.8 :
                           simulationMarketCondition === 'recession' || simulationMarketCondition === 'slow' ? -0.8 : 0;

    // Strong market signal overrides weak simulation
    if (Math.abs(marketTrendValue) > 0.5 && Math.abs(simulationTrend) < 0.3) {
      return {
        id: `override-market-future`,
        overriddenEngine: 'future_simulation',
        overridingEngine: 'market',
        subject: 'Demand trajectory projection',
        originalValue: simulationMarketCondition,
        overriddenValue: marketTrendType,
        justification: `Strong market signal (${marketTrendType}) takes precedence over uncertain simulation`,
        isWarranted: Math.abs(marketTrendValue) > 0.3,
      };
    }

    return null;
  }

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================

  private detectConflicts(results: IntelligenceResults): EngineConflict[] {
    const conflicts: EngineConflict[] = [];

    // Check for regret vs optionality conflict
    const regretOptionalityConflict = this.checkRegretOptionalityConflict(results);
    if (regretOptionalityConflict) {
      conflicts.push(regretOptionalityConflict);
    }

    // Check for criticality vs coalition conflict
    const criticalityCoalitionConflict = this.checkCriticalityCoalitionConflict(results);
    if (criticalityCoalitionConflict) {
      conflicts.push(criticalityCoalitionConflict);
    }

    return conflicts;
  }

  private checkRegretOptionalityConflict(results: IntelligenceResults): EngineConflict | null {
    if (!results.regret || !results.optionality) return null;

    const optionality = Array.isArray(results.optionality)
      ? results.optionality[0]
      : results.optionality;

    const rankedPaths = results.regret.rankedPaths;
    const regretPath = Array.isArray(rankedPaths) && rankedPaths.length > 0 ? rankedPaths[0] : undefined;
    
    if (!regretPath) return null;

    // Low optionality + high regret = conflict (student wants flexibility but path doesn't offer it)
    const optionalityScore = (optionality.overallScore || 0) / 100;
    const regretRisk = (regretPath.aggregate?.overallRegretScore || 0) / 100;

    if (optionalityScore < 0.4 && regretRisk > 0.6) {
      return {
        id: `conflict-regret-optionality`,
        engines: ['regret', 'optionality'],
        subject: 'Future flexibility vs regret risk',
        positions: {
          regret: regretRisk,
          optionality: optionalityScore,
        },
        severity: 'high',
        resolutionStrategy: 'investigate',
        prioritizedEngine: 'regret',
      };
    }

    return null;
  }

  private checkCriticalityCoalitionConflict(results: IntelligenceResults): EngineConflict | null {
    if (!results.criticality || !results.coalition) return null;

    const criticality = Array.isArray(results.criticality)
      ? results.criticality[0]
      : results.criticality;

    // Get coalition flexibility
    const pathAnalyses = results.coalition.pathAnalyses;
    const firstPath = pathAnalyses instanceof Map 
      ? Array.from(pathAnalyses.values())[0]
      : Array.isArray(pathAnalyses) ? pathAnalyses[0] : undefined;

    // High criticality + high coalition flexibility expectation = conflict
    const criticalityScore = (criticality.criticalityScore || 0) / 100;
    const coalitionFlexibility = (firstPath?.dynamics?.consensusLevel === 'strong' ? 0.8 : 0.5);

    if (criticalityScore > 0.7 && coalitionFlexibility > 0.7) {
      return {
        id: `conflict-criticality-coalition`,
        engines: ['criticality', 'coalition'],
        subject: 'Career constraint vs expected flexibility',
        positions: {
          criticality: criticalityScore,
          coalition: coalitionFlexibility,
        },
        severity: 'medium',
        resolutionStrategy: 'escalate',
      };
    }

    return null;
  }

  // ============================================================================
  // REASONING GRAPH BUILDER
  // ============================================================================

  private buildReasoningGraph(
    results: IntelligenceResults,
    violations: ConsistencyViolation[],
    agreements: EngineAgreement[]
  ): ReasoningGraph {
    const nodes: ReasoningNode[] = [];
    const edges: ReasoningEdge[] = [];
    const conclusions: string[] = [];
    const evidence: string[] = [];

    // Add engine output nodes
    if (results.matching) {
      const nodeId = 'matching_output';
      const topMatch = results.matching.matches?.[0];
      nodes.push({
        id: nodeId,
        engine: 'matching',
        claim: `Top match: ${topMatch?.careerId || 'unknown'}`,
        confidence: 0.85,
        type: 'assertion',
        numericValue: topMatch?.score,
      });
    }

    if (results.coalition) {
      const nodeId = 'coalition_output';
      nodes.push({
        id: nodeId,
        engine: 'coalition',
        claim: `Coalition cohesion: ${results.coalition.coalitionHealth?.cohesion || 0}`,
        confidence: results.coalition.coalitionHealth?.confidence || 0.7,
        type: 'assertion',
        numericValue: results.coalition.coalitionHealth?.cohesion,
      });
    }

    if (results.regret) {
      const nodeId = 'regret_output';
      nodes.push({
        id: nodeId,
        engine: 'regret',
        claim: `Average regret: ${results.regret.overallProfile?.averageRegret || 0}`,
        confidence: 0.75,
        type: 'assertion',
        numericValue: results.regret.overallProfile?.averageRegret,
      });
    }

    // Add violation nodes
    for (const violation of violations) {
      const nodeId = `violation_${violation.id}`;
      nodes.push({
        id: nodeId,
        engine: violation.involvedEngines[0],
        claim: violation.description,
        confidence: violation.detectionConfidence,
        type: 'inference',
      });

      // Connect to involved engine nodes
      for (const engine of violation.involvedEngines) {
        edges.push({
          id: `edge_violation_${violation.id}_${engine}`,
          from: `${engine}_output`,
          to: nodeId,
          relationship: 'contradicts',
          strength: violation.detectionConfidence,
          explanation: violation.explanation,
        });
      }
    }

    // Add agreement nodes
    for (const agreement of agreements) {
      const nodeId = `agreement_${agreement.id}`;
      nodes.push({
        id: nodeId,
        engine: agreement.engines[0],
        claim: agreement.subject,
        confidence: agreement.strength,
        type: 'conclusion',
        numericValue: typeof agreement.agreedValue === 'number' ? agreement.agreedValue : undefined,
      });
      conclusions.push(nodeId);

      // Connect to involved engine nodes
      for (const engine of agreement.engines) {
        edges.push({
          id: `edge_agreement_${agreement.id}_${engine}`,
          from: `${engine}_output`,
          to: nodeId,
          relationship: 'supports',
          strength: agreement.strength,
          explanation: agreement.explanation,
        });
      }
    }

    // Add final recommendation node
    if (results.recommendations && results.recommendations.length > 0) {
      const recNodeId = 'final_recommendation';
      nodes.push({
        id: recNodeId,
        engine: 'recommendation',
        claim: `Recommend: ${results.recommendations[0].path?.nodes?.[0]?.name || 'unknown'}`,
        confidence: results.recommendations[0].confidence,
        type: 'conclusion',
      });
      conclusions.push(recNodeId);
    }

    return {
      nodes,
      edges,
      conclusions,
      evidence,
    };
  }

  // ============================================================================
  // SCORING & CALCULATIONS
  // ============================================================================

  private calculateConsistencyScore(
    violations: ConsistencyViolation[],
    agreements: EngineAgreement[],
    conflicts: EngineConflict[],
    results: IntelligenceResults
  ): number {
    let score = 100;

    // Deduct for violations based on severity
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
        case 'info':
          score -= 1;
          break;
      }
    }

    // Deduct for unresolved conflicts
    score -= conflicts.length * 5;

    // Add bonus for strong agreements
    for (const agreement of agreements) {
      if (agreement.strength > this.config.rules.thresholds.minAgreementStrength) {
        score += 5;
      }
    }

    // Count active engines
    const activeEngines = this.countActiveEngines(results);
    if (activeEngines < 3) {
      score -= (3 - activeEngines) * 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateEngineReliability(
    violations: ConsistencyViolation[],
    agreements: EngineAgreement[]
  ): Record<EngineSource, number> {
    const reliability: Partial<Record<EngineSource, number>> = {};
    const engines: EngineSource[] = [
      'matching', 'utility', 'optionality', 'criticality',
      'coalition', 'regret', 'market', 'future_simulation', 'recommendation'
    ];

    for (const engine of engines) {
      let score = 1.0;

      // Reduce for violations this engine is involved in
      const engineViolations = violations.filter(v => v.involvedEngines.includes(engine));
      for (const v of engineViolations) {
        const penalty = v.severity === 'critical' ? 0.2 : v.severity === 'high' ? 0.15 : 0.1;
        score -= penalty;
      }

      // Increase for agreements this engine participates in
      const engineAgreements = agreements.filter(a => a.engines.includes(engine));
      for (const a of engineAgreements) {
        score += 0.05 * a.strength;
      }

      reliability[engine] = Math.max(0.3, Math.min(1, score));
    }

    return reliability as Record<EngineSource, number>;
  }

  private generateTopRecommendation(
    results: IntelligenceResults,
    agreements: EngineAgreement[],
    conflicts: EngineConflict[],
    engineReliability: Record<EngineSource, number>
  ): TopRecommendation | null {
    if (!results.recommendations || results.recommendations.length === 0) {
      return null;
    }

    const topRec = results.recommendations[0];
    const pathId = topRec.path.id;

    // Find supporting engines
    const supportingEngines: EngineSource[] = [];
    const opposingEngines: EngineSource[] = [];

    // Check which engines support this path
    if (results.matching?.matches?.[0]?.careerId === pathId) {
      supportingEngines.push('matching');
    }

    const rankedPaths = results.coalition?.rankedPaths;
    if (Array.isArray(rankedPaths) && rankedPaths[0]?.pathId === pathId) {
      supportingEngines.push('coalition');
    }

    const regretPaths = results.regret?.rankedPaths;
    if (Array.isArray(regretPaths) && regretPaths.length > 0) {
      const lowestRegretPath = regretPaths[0];
      if (lowestRegretPath?.pathId === pathId && (lowestRegretPath.aggregate?.overallRegretScore || 100) < 40) {
        supportingEngines.push('regret');
      }
    }

    // Check agreements
    const pathAgreements = agreements.filter(a => a.targetId === pathId);
    const crossEngineAgreement = pathAgreements.length > 0
      ? pathAgreements.reduce((sum, a) => sum + a.strength, 0) / pathAgreements.length
      : 0.5;

    // Calculate weighted confidence
    let weightedConfidence = topRec.confidence;
    for (const engine of supportingEngines) {
      weightedConfidence *= engineReliability[engine];
    }

    return {
      pathId,
      confidence: weightedConfidence,
      supportingEngines,
      opposingEngines,
      reasoning: `Selected based on ${supportingEngines.length} engine consensus with ${(crossEngineAgreement * 100).toFixed(0)}% cross-engine agreement`,
      crossEngineAgreement,
    };
  }

  private interpretScore(
    score: number,
    violations: ConsistencyViolation[],
    agreements: EngineAgreement[]
  ): ConsistencyInterpretation {
    let category: ConsistencyInterpretation['category'];
    let summary: string;
    let explanation: string;
    let recommendations: string[] = [];

    if (score >= 90) {
      category = 'excellent';
      summary = 'Strong cross-engine agreement';
      explanation = 'All intelligence engines are aligned and producing consistent results.';
      recommendations = ['Proceed with recommendations', 'Document this as a model case'];
    } else if (score >= 70) {
      category = 'good';
      summary = 'Minor inconsistencies detected';
      explanation = `Most engines agree, but ${violations.length} minor issues need attention.`;
      recommendations = ['Review low-severity violations', 'Consider gathering more data'];
    } else if (score >= 50) {
      category = 'fair';
      summary = 'Some concerns need attention';
      explanation = `Multiple inconsistencies detected (${violations.length} violations, ${agreements.length} agreements).`;
      recommendations = [
        'Investigate high-priority violations',
        'Validate conflicting engine outputs',
        'Consider stakeholder interviews',
      ];
    } else if (score >= 30) {
      category = 'poor';
      summary = 'Significant conflicts between engines';
      explanation = `Major disagreements detected. Recommendations may be unreliable.`;
      recommendations = [
        'Do not proceed with current recommendations',
        'Conduct detailed conflict resolution',
        'Gather additional validation data',
        'Escalate to human reviewer',
      ];
    } else {
      category = 'critical';
      summary = 'Major contradictions - recommendations unreliable';
      explanation = `Critical inconsistencies threaten recommendation validity.`;
      recommendations = [
        'HALT: Do not use these recommendations',
        'Immediate human review required',
        'Rebuild analysis from scratch',
        'Check for data corruption',
      ];
    }

    return { category, summary, explanation, recommendations };
  }

  private calculateStatistics(
    violations: ConsistencyViolation[],
    agreements: EngineAgreement[],
    weakChains: WeakReasoningChain[],
    conflicts: EngineConflict[],
    results: IntelligenceResults,
    engineReliability: Record<EngineSource, number>
  ): ConsistencyStatistics {
    const violationsBySeverity: Record<ViolationSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const v of violations) {
      violationsBySeverity[v.severity]++;
    }

    const reliabilities = Object.entries(engineReliability);
    const sortedReliabilities = reliabilities.sort((a, b) => b[1] - a[1]);

    const avgConfidence = reliabilities.length > 0 
      ? reliabilities.reduce((sum, [, r]) => sum + r, 0) / reliabilities.length 
      : 0;

    return {
      totalEngines: this.countActiveEngines(results),
      totalViolations: violations.length,
      violationsBySeverity,
      totalAgreements: agreements.length,
      totalWeakChains: weakChains.length,
      totalConflicts: conflicts.length,
      averageEngineConfidence: avgConfidence,
      mostReliableEngine: sortedReliabilities[0]?.[0] as EngineSource || null,
      leastReliableEngine: sortedReliabilities[sortedReliabilities.length - 1]?.[0] as EngineSource || null,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): ConsistencyId {
    return `consistency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private applyFilters(results: IntelligenceResults, options: ConsistencyAnalysisOptions): IntelligenceResults {
    if (!options.includeEngines && !options.excludeEngines && !options.targetPathId) {
      return results;
    }

    const filtered: IntelligenceResults = { ...results };

    if (options.excludeEngines) {
      for (const engine of options.excludeEngines) {
        switch (engine) {
          case 'matching':
            filtered.matching = undefined;
            break;
          case 'optionality':
            filtered.optionality = undefined;
            break;
          case 'criticality':
            filtered.criticality = undefined;
            break;
          case 'coalition':
            filtered.coalition = undefined;
            break;
          case 'regret':
            filtered.regret = undefined;
            break;
          case 'market':
            filtered.market = undefined;
            break;
          case 'future_simulation':
            filtered.futureSimulation = undefined;
            break;
          case 'recommendation':
            filtered.recommendations = undefined;
            break;
        }
      }
    }

    return filtered;
  }

  private applyRuleOverrides(): void {
    for (const [ruleId, override] of Object.entries(this.config.rules.ruleOverrides)) {
      const rule = this.rules.find(r => r.id === ruleId);
      if (rule) {
        rule.enabled = override.enabled;
        rule.defaultSeverity = override.severity;
      }
    }
  }

  private countActiveEngines(results: IntelligenceResults): number {
    let count = 0;
    if (results.matching) count++;
    if (results.utility) count++;
    if (results.optionality) count++;
    if (results.criticality) count++;
    if (results.coalition) count++;
    if (results.regret) count++;
    if (results.market) count++;
    if (results.futureSimulation) count++;
    if (results.recommendations) count++;
    return count;
  }

  private severityRank(severity: ViolationSeverity): number {
    const ranks: Record<ViolationSeverity, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    };
    return ranks[severity];
  }

  private createErrorReport(id: ConsistencyId, error: string): ConsistencyReport {
    return {
      id,
      timestamp: Date.now(),
      consistencyScore: 0,
      interpretation: {
        category: 'critical',
        summary: 'Validation error',
        explanation: error,
        recommendations: ['Check input data', 'Verify all required fields are present'],
      },
      violations: [],
      agreements: [],
      weakChains: [],
      overrides: [],
      conflicts: [],
      reasoningGraph: { nodes: [], edges: [], conclusions: [], evidence: [] },
      engineReliability: {} as Record<EngineSource, number>,
      topRecommendation: null,
      statistics: {
        totalEngines: 0,
        totalViolations: 0,
        violationsBySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        totalAgreements: 0,
        totalWeakChains: 0,
        totalConflicts: 0,
        averageEngineConfidence: 0,
        mostReliableEngine: null,
        leastReliableEngine: null,
      },
    };
  }
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONSISTENCY_CONFIG: ConsistencyEngineConfig = {
  enableContradictionDetection: true,
  enableAgreementDetection: true,
  enableWeakChainDetection: true,
  enableOverrideDetection: true,
  enableConflictDetection: true,
  minConfidenceThreshold: 0.3,
  rules: {
    ruleOverrides: {},
    customRules: [],
    thresholds: {
      minAgreementStrength: 0.7,
      maxChainWeakness: 0.5,
      criticalViolationThreshold: 3,
    },
  },
  engineWeights: {
    matching: 0.15,
    utility: 0.1,
    optionality: 0.1,
    criticality: 0.1,
    coalition: 0.15,
    regret: 0.15,
    market: 0.1,
    future_simulation: 0.1,
    recommendation: 0.05,
  },
  logLevel: 'info',
};

// ============================================================================
// BUILT-IN VALIDATION RULES
// ============================================================================

const BUILT_IN_RULES: ConsistencyRule[] = [
  {
    id: 'min-confidence-threshold',
    name: 'Minimum Confidence Threshold',
    description: 'All engine outputs must meet minimum confidence threshold',
    applicableEngines: ['matching', 'coalition', 'regret', 'recommendation'],
    defaultSeverity: 'medium',
    enabled: true,
    validate: (results) => {
      const lowConfidenceEngines: string[] = [];

      if (results.matching?.matches?.[0] && !results.matching.matches[0].score) {
        lowConfidenceEngines.push('matching');
      }
      if (results.coalition?.coalitionHealth?.confidence && results.coalition.coalitionHealth.confidence < 0.5) {
        lowConfidenceEngines.push('coalition');
      }

      if (lowConfidenceEngines.length > 0) {
        return {
          id: 'low-confidence',
          type: 'weak_chain',
          severity: 'medium',
          involvedEngines: lowConfidenceEngines as EngineSource[],
          description: `Low confidence in ${lowConfidenceEngines.join(', ')} engine outputs`,
          explanation: 'One or more engines have confidence below acceptable threshold',
          conflictingValues: lowConfidenceEngines.map(e => ({
            engine: e as EngineSource,
            attribute: 'confidence',
            value: 'below threshold',
            confidence: 0.5,
          })),
          resolution: {
            action: 'Gather more assessment data to increase confidence',
            reasoning: 'Low confidence reduces recommendation reliability',
            priority: 2,
            expectedImpact: 15,
          },
          detectionConfidence: 0.9,
        };
      }

      return null;
    },
  },

  {
    id: 'recommendation-support',
    name: 'Recommendation Support Check',
    description: 'Final recommendation must be supported by at least 2 engines',
    applicableEngines: ['recommendation', 'matching', 'coalition'],
    defaultSeverity: 'high',
    enabled: true,
    validate: (results) => {
      if (!results.recommendations || results.recommendations.length === 0) return null;

      const topRec = results.recommendations[0];
      const pathId = topRec.path.id;

      let supportingEngines = 0;
      if (results.matching?.matches?.[0]?.careerId === pathId) supportingEngines++;
      
      const rankedPaths = results.coalition?.rankedPaths;
      if (Array.isArray(rankedPaths) && rankedPaths[0]?.pathId === pathId) supportingEngines++;

      if (supportingEngines < 2) {
        return {
          id: 'weak-recommendation-support',
          type: 'weak_chain',
          severity: 'high',
          involvedEngines: ['recommendation'],
          description: `Top recommendation supported by only ${supportingEngines} engine(s)`,
          explanation: 'Recommendations should have cross-engine consensus for reliability',
          conflictingValues: [{
            engine: 'recommendation',
            attribute: 'supportingEngines',
            value: supportingEngines,
            confidence: topRec.confidence,
          }],
          resolution: {
            action: 'Validate recommendation with additional engine analysis',
            reasoning: 'Cross-engine support increases recommendation confidence',
            priority: 1,
            expectedImpact: 20,
          },
          detectionConfidence: 0.85,
        };
      }

      return null;
    },
  },
];

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new ConsistencyEngine with default configuration.
 */
export function createConsistencyEngine(config?: Partial<ConsistencyEngineConfig>): ConsistencyEngine {
  return new ConsistencyEngine(config);
}

/**
 * Quick validation function for one-off checks.
 */
export function validateConsistency(
  results: IntelligenceResults,
  options?: ConsistencyAnalysisOptions
): ConsistencyReport {
  const engine = new ConsistencyEngine();
  return engine.validate(results, options);
}

/**
 * Check if results are sufficiently consistent.
 */
export function isConsistent(results: IntelligenceResults, threshold = 70): boolean {
  const engine = new ConsistencyEngine();
  return engine.isConsistent(results, threshold);
}
