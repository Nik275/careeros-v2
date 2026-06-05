/**
 * Career Graph Engine
 *
 * Master orchestrator for the Career Graph Intelligence system.
 * Integrates all engines to provide comprehensive career path analysis.
 */

import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  NodeId,
  CareerGraphReport,
  RankedNode,
  RecommendedPath,
  PathSimulation,
  CareerCascade,
  StudentCareerContext,
  CareerGraphConfig,
  DEFAULT_CAREER_GRAPH_CONFIG,
  CareerGraphEvent,
  CareerGraphEventType,
} from './career-graph-types';

import { GraphBuilder, PREDEFINED_PATHWAYS } from './graph-builder';
import { PathSimulator, DEFAULT_SIMULATOR_OPTIONS } from './path-simulator';
import { OpportunityEngine, DEFAULT_OPPORTUNITY_OPTIONS } from './opportunity-engine';
import { OptionalityEngine, DEFAULT_OPTIONALITY_OPTIONS } from './optionality-engine';
import { IrreversibilityEngine, DEFAULT_IRREVERSIBILITY_OPTIONS } from './irreversibility-engine';
import { CareerCascadeEngine, DEFAULT_CASCADE_OPTIONS } from './career-cascade-engine';

export interface CareerGraphEngineOptions {
  config?: Partial<CareerGraphConfig>;
  usePredefinedGraph?: boolean;
  autoBuild?: boolean;
}

export class CareerGraphEngine {
  private graph: CareerGraph;
  private builder: GraphBuilder;
  private pathSimulator: PathSimulator;
  private opportunityEngine: OpportunityEngine;
  private optionalityEngine: OptionalityEngine;
  private irreversibilityEngine: IrreversibilityEngine;
  private cascadeEngine: CareerCascadeEngine;
  private config: CareerGraphConfig;
  private eventListeners: Array<(event: CareerGraphEvent) => void> = [];

  constructor(options: CareerGraphEngineOptions = {}) {
    this.config = { ...DEFAULT_CAREER_GRAPH_CONFIG, ...options.config };
    this.builder = new GraphBuilder();
    
    if (options.usePredefinedGraph !== false) {
      this.graph = this.builder.buildPredefinedGraph();
    } else {
      this.graph = this.builder.getGraph();
    }

    this.pathSimulator = new PathSimulator(this.graph, DEFAULT_SIMULATOR_OPTIONS);
    this.opportunityEngine = new OpportunityEngine(this.graph, DEFAULT_OPPORTUNITY_OPTIONS);
    this.optionalityEngine = new OptionalityEngine(this.graph, DEFAULT_OPTIONALITY_OPTIONS);
    this.irreversibilityEngine = new IrreversibilityEngine(this.graph, DEFAULT_IRREVERSIBILITY_OPTIONS);
    this.cascadeEngine = new CareerCascadeEngine(this.graph, DEFAULT_CASCADE_OPTIONS);
  }

  // ============================================================================
  // CORE ANALYSIS API
  // ============================================================================

  /**
   * Generate comprehensive career graph report for a student
   */
  generateReport(
    studentContext: StudentCareerContext,
    candidateNodeIds?: NodeId[]
  ): CareerGraphReport {
    const startTime = Date.now();
    
    // Determine nodes to analyze
    const nodesToAnalyze = candidateNodeIds || this.getRelevantNodes(studentContext);
    
    // Generate all rankings
    const optionalityRanking = this.generateOptionalityRanking(nodesToAnalyze);
    const riskRanking = this.generateRiskRanking(nodesToAnalyze);
    const reversibilityRanking = this.generateReversibilityRanking(nodesToAnalyze);
    const futureOpportunityRanking = this.generateFutureOpportunityRanking(nodesToAnalyze);
    
    // Generate recommended paths
    const recommendedPaths = this.generateRecommendedPaths(
      nodesToAnalyze,
      studentContext
    );
    
    // Generate simulations for top candidates
    const topNodes = optionalityRanking.slice(0, 5).map(r => r.nodeId);
    const simulations = this.generateSimulations(topNodes);
    
    // Generate cascades
    const cascades = this.generateCascades(topNodes);
    
    // Generate insights
    const insights = this.generateInsights(
      optionalityRanking,
      riskRanking,
      reversibilityRanking,
      futureOpportunityRanking
    );
    
    const warnings = this.generateWarnings(nodesToAnalyze);
    const recommendations = this.generateRecommendations(
      studentContext,
      optionalityRanking,
      recommendedPaths
    );

    const report: CareerGraphReport = {
      id: `report-${studentContext.studentId}-${startTime}`,
      generatedAt: startTime,
      studentId: studentContext.studentId,
      optionalityRanking,
      riskRanking,
      reversibilityRanking,
      futureOpportunityRanking,
      recommendedPaths,
      simulations,
      cascades,
      keyInsights: insights,
      warnings,
      recommendations,
    };

    this.emitEvent('path-simulated', { reportId: report.id, nodesAnalyzed: nodesToAnalyze.length });

    return report;
  }

  /**
   * Quick analysis for a specific career decision
   */
  analyzeDecision(nodeId: NodeId, context?: Partial<StudentCareerContext>): {
    optionality: ReturnType<OptionalityEngine['calculateOptionality']>;
    irreversibility: ReturnType<IrreversibilityEngine['calculateIrreversibility']>;
    opportunities: ReturnType<OpportunityEngine['calculateOpportunities']>;
    simulation3Year: PathSimulation;
    simulation5Year: PathSimulation;
    simulation10Year: PathSimulation;
    cascade: CareerCascade;
    summary: string;
  } {
    const optionality = this.optionalityEngine.calculateOptionality(nodeId);
    const irreversibility = this.irreversibilityEngine.calculateIrreversibility(nodeId);
    const opportunities = this.opportunityEngine.calculateOpportunities(nodeId);
    
    const simulation3Year = this.pathSimulator.simulate(nodeId, 3, {
      age: context?.age || 18,
      currentEarnings: 0,
      completedNodes: [nodeId],
    });
    
    const simulation5Year = this.pathSimulator.simulate(nodeId, 5, {
      age: context?.age || 18,
      currentEarnings: 0,
      completedNodes: [nodeId],
    });
    
    const simulation10Year = this.pathSimulator.simulate(nodeId, 10, {
      age: context?.age || 18,
      currentEarnings: 0,
      completedNodes: [nodeId],
    });
    
    const cascade = this.cascadeEngine.generateCascade(nodeId);

    const summary = this.generateDecisionSummary(
      nodeId,
      optionality,
      irreversibility,
      opportunities
    );

    return {
      optionality,
      irreversibility,
      opportunities,
      simulation3Year,
      simulation5Year,
      simulation10Year,
      cascade,
      summary,
    };
  }

  // ============================================================================
  // RANKING GENERATORS
  // ============================================================================

  private generateOptionalityRanking(nodeIds: NodeId[]): RankedNode[] {
    return nodeIds
      .map(nodeId => {
        const score = this.optionalityEngine.calculateOptionality(nodeId);
        const node = this.graph.nodes.get(nodeId);
        
        return {
          nodeId,
          name: node?.name || nodeId,
          score: score.score,
          percentile: score.percentileRank,
          rationale: score.contributingFactors[0] || 'Standard optionality profile',
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private generateRiskRanking(nodeIds: NodeId[]): RankedNode[] {
    return nodeIds
      .map(nodeId => {
        const irreversibility = this.irreversibilityEngine.calculateIrreversibility(nodeId);
        const opportunities = this.opportunityEngine.calculateOpportunities(nodeId);
        const node = this.graph.nodes.get(nodeId);
        
        // Risk is combination of irreversibility and low optionality
        const riskScore = Math.round(
          irreversibility.score * 0.6 +
          (100 - opportunities.highQualityOpportunities * 10) * 0.4
        );
        
        return {
          nodeId,
          name: node?.name || nodeId,
          score: riskScore,
          percentile: Math.round(riskScore),
          rationale: irreversibility.irreversibilityFactors[0] || 'Standard risk profile',
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private generateReversibilityRanking(nodeIds: NodeId[]): RankedNode[] {
    return nodeIds
      .map(nodeId => {
        const irreversibility = this.irreversibilityEngine.calculateIrreversibility(nodeId);
        const node = this.graph.nodes.get(nodeId);
        
        // Reversibility score is inverse of irreversibility
        const reversibilityScore = 100 - irreversibility.score;
        
        return {
          nodeId,
          name: node?.name || nodeId,
          score: reversibilityScore,
          percentile: Math.round(reversibilityScore),
          rationale: irreversibility.reversibleWithin.oneYear > 0.5
            ? 'Easily reversible within 1 year'
            : 'Difficult to reverse',
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private generateFutureOpportunityRanking(nodeIds: NodeId[]): RankedNode[] {
    return nodeIds
      .map(nodeId => {
        const opportunities = this.opportunityEngine.calculateOpportunities(nodeId);
        const node = this.graph.nodes.get(nodeId);
        
        // Score based on quantity and quality of opportunities
        const opportunityScore = Math.min(100,
          opportunities.totalOpportunities * 5 +
          opportunities.highQualityOpportunities * 10
        );
        
        return {
          nodeId,
          name: node?.name || nodeId,
          score: opportunityScore,
          percentile: Math.round(opportunityScore),
          rationale: `${opportunities.totalOpportunities} future opportunities identified`,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  // ============================================================================
  // PATH GENERATION
  // ============================================================================

  private generateRecommendedPaths(
    nodeIds: NodeId[],
    context: StudentCareerContext
  ): RecommendedPath[] {
    const paths: RecommendedPath[] = [];
    
    // Analyze top 5 nodes as potential starting points
    const topNodes = this.optionalityEngine
      .compareOptionality(nodeIds)
      .slice(0, 5);
    
    for (const nodeInfo of topNodes) {
      const cascade = this.cascadeEngine.generateCascade(nodeInfo.nodeId);
      const optionality = this.optionalityEngine.calculateOptionality(nodeInfo.nodeId);
      const irreversibility = this.irreversibilityEngine.calculateIrreversibility(nodeInfo.nodeId);
      
      const path: RecommendedPath = {
        id: `path-${nodeInfo.nodeId}`,
        name: `${nodeInfo.nodeName} Path`,
        nodes: cascade.stages.map(s => s.nodeId),
        optionalityScore: optionality.score,
        riskScore: irreversibility.score,
        opportunityScore: nodeInfo.careerOptions * 10,
        alignmentScore: this.calculateAlignmentScore(nodeInfo.nodeId, context),
        rationale: this.generatePathRationale(nodeInfo, cascade),
        keyMilestones: cascade.stages
          .filter(s => s.isDecisionPoint)
          .map(s => s.name),
        estimatedTimeline: cascade.typicalTimeline,
      };
      
      paths.push(path);
    }
    
    return paths.sort((a, b) => b.alignmentScore - a.alignmentScore);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getRelevantNodes(context: StudentCareerContext): NodeId[] {
    const nodes: NodeId[] = [];
    
    // Based on current subjects
    if (context.academicProfile.currentSubjects.includes('pcm')) {
      nodes.push('pcm-12', 'jee', 'iit-cs', 'swe', 'ai-engineer');
    }
    if (context.academicProfile.currentSubjects.includes('pcb')) {
      nodes.push('pcb-12', 'neet', 'mbbs', 'doctor');
    }
    if (context.academicProfile.currentSubjects.includes('commerce')) {
      nodes.push('commerce-12', 'ca', 'bcom', 'mba-finance');
    }
    if (context.academicProfile.currentSubjects.includes('arts')) {
      nodes.push('arts-12', 'ba', 'upsc', 'ias');
    }
    
    // If no specific subjects, return all subject choices
    if (nodes.length === 0) {
      for (const [id] of Array.from(this.graph.nodes)) {
        nodes.push(id);
      }
    }
    
    return Array.from(new Set(nodes));
  }

  private generateSimulations(nodeIds: NodeId[]): PathSimulation[] {
    return nodeIds.map(nodeId => 
      this.pathSimulator.simulate(nodeId, this.config.defaultHorizon)
    );
  }

  private generateCascades(nodeIds: NodeId[]): CareerCascade[] {
    return nodeIds.map(nodeId => 
      this.cascadeEngine.generateCascade(nodeId)
    );
  }

  private generateInsights(
    optionalityRanking: RankedNode[],
    riskRanking: RankedNode[],
    reversibilityRanking: RankedNode[],
    futureOpportunityRanking: RankedNode[]
  ): string[] {
    const insights: string[] = [];
    
    if (optionalityRanking.length > 0) {
      const topOptionality = optionalityRanking[0];
      insights.push(
        `${topOptionality.name} offers the highest future flexibility with a score of ${topOptionality.score}/100`
      );
    }
    
    if (riskRanking.length > 0) {
      const highestRisk = riskRanking[0];
      if (highestRisk.score > 70) {
        insights.push(
          `${highestRisk.name} carries significant commitment risk - difficult to reverse once chosen`
        );
      }
    }
    
    if (reversibilityRanking.length > 0) {
      const mostReversible = reversibilityRanking[0];
      insights.push(
        `${mostReversible.name} allows easiest pivot if needed`
      );
    }
    
    if (futureOpportunityRanking.length > 0) {
      const topOpportunity = futureOpportunityRanking[0];
      insights.push(
        `${topOpportunity.name} opens the most future career opportunities`
      );
    }
    
    return insights;
  }

  private generateWarnings(nodeIds: NodeId[]): string[] {
    const warnings: string[] = [];
    
    for (const nodeId of nodeIds) {
      const irreversibility = this.irreversibilityEngine.calculateIrreversibility(nodeId);
      const optionality = this.optionalityEngine.calculateOptionality(nodeId);
      
      if (irreversibility.score > 80 && optionality.score < 40) {
        const node = this.graph.nodes.get(nodeId);
        warnings.push(
          `${node?.name || nodeId}: High commitment with limited flexibility - ensure alignment with long-term goals`
        );
      }
    }
    
    return warnings;
  }

  private generateRecommendations(
    context: StudentCareerContext,
    optionalityRanking: RankedNode[],
    recommendedPaths: RecommendedPath[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Based on risk tolerance
    if (context.preferences.riskTolerance === 'low') {
      const reversiblePaths = recommendedPaths
        .filter(p => p.riskScore < 50)
        .slice(0, 2);
      
      for (const path of reversiblePaths) {
        recommendations.push(`Consider ${path.name} for lower-risk career progression`);
      }
    }
    
    // Based on optionality preference
    if (context.preferences.optionalityPreference === 'high') {
      if (optionalityRanking.length > 0) {
        recommendations.push(
          `Explore ${optionalityRanking[0].name} for maximum future flexibility`
        );
      }
    }
    
    return recommendations;
  }

  private calculateAlignmentScore(nodeId: NodeId, context: StudentCareerContext): number {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return 0;
    
    let score = 50; // Base score
    
    // Match with interests
    const interestMatch = context.academicProfile.interests.filter(interest =>
      node.name.toLowerCase().includes(interest.toLowerCase()) ||
      node.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    ).length;
    score += interestMatch * 10;
    
    // Match with goals
    const allGoals = [
      ...context.goals.shortTerm,
      ...context.goals.mediumTerm,
      ...context.goals.longTerm,
    ];
    const goalMatch = allGoals.filter(goal =>
      node.name.toLowerCase().includes(goal.toLowerCase())
    ).length;
    score += goalMatch * 15;
    
    return Math.min(100, score);
  }

  private generatePathRationale(
    nodeInfo: { nodeId: NodeId; nodeName: string },
    cascade: CareerCascade
  ): string {
    const stageCount = cascade.stages.length;
    const outcomeCount = cascade.finalOutcomes.length;
    const timeline = (cascade.typicalTimeline / 12).toFixed(1);
    
    return `${nodeInfo.nodeName} offers a ${stageCount}-stage path with ${outcomeCount} potential outcomes over approximately ${timeline} years.`;
  }

  private generateDecisionSummary(
    nodeId: NodeId,
    optionality: ReturnType<OptionalityEngine['calculateOptionality']>,
    irreversibility: ReturnType<IrreversibilityEngine['calculateIrreversibility']>,
    opportunities: ReturnType<OpportunityEngine['calculateOpportunities']>
  ): string {
    const node = this.graph.nodes.get(nodeId);
    const reversibilityText = irreversibility.reversibleWithin.oneYear > 0.5
      ? 'easily reversible'
      : irreversibility.reversibleWithin.fiveYears > 0.3
      ? 'reversible within 5 years'
      : 'difficult to reverse';
    
    return `${node?.name || nodeId}: Optionality ${optionality.score}/100, ${opportunities.totalOpportunities} future opportunities, ${reversibilityText}.`;
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  onEvent(listener: (event: CareerGraphEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(type: CareerGraphEventType, data: unknown): void {
    const event: CareerGraphEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getGraph(): CareerGraph {
    return this.graph;
  }

  getNode(nodeId: NodeId): CareerNode | undefined {
    return this.graph.nodes.get(nodeId);
  }

  getAllNodes(): CareerNode[] {
    return Array.from(this.graph.nodes.values());
  }

  getGraphStatistics(): ReturnType<GraphBuilder['getStatistics']> {
    return this.builder.getStatistics();
  }

  /**
   * Answer specific career questions
   */
  answerQuestion(question: string, nodeId: NodeId): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('future doors') || lowerQuestion.includes('open')) {
      const opportunities = this.opportunityEngine.calculateOpportunities(nodeId);
      return `This opens ${opportunities.totalOpportunities} future opportunities: ${opportunities.nearTerm.length} near-term, ${opportunities.mediumTerm.length} medium-term, and ${opportunities.longTerm.length} long-term.`;
    }
    
    if (lowerQuestion.includes('close') || lowerQuestion.includes('sacrifice')) {
      const optionality = this.optionalityEngine.calculateOptionality(nodeId);
      const limitingFactors = optionality.limitingFactors;
      return limitingFactors.length > 0
        ? `This may limit: ${limitingFactors.join(', ')}`
        : 'This path maintains good flexibility with minimal doors closed.';
    }
    
    if (lowerQuestion.includes('pivot') || lowerQuestion.includes('reverse')) {
      const irreversibility = this.irreversibilityEngine.calculateIrreversibility(nodeId);
      return `Reversibility: ${irreversibility.reversibleWithin.oneYear > 0.5 ? 'Easy within 1 year' : irreversibility.reversibleWithin.fiveYears > 0.3 ? 'Possible within 5 years' : 'Very difficult'}. ${irreversibility.irreversibilityFactors[0] || ''}`;
    }
    
    if (lowerQuestion.includes('5 years') || lowerQuestion.includes('look like')) {
      const simulation = this.pathSimulator.simulate(nodeId, 5);
      const mostLikelyPath = simulation.likelyPaths[0];
      return `In 5 years, you're most likely to be: ${mostLikelyPath?.nodes.map(n => this.graph.nodes.get(n)?.name).join(' → ') || 'Unable to predict'}. Expected earnings: ₹${(mostLikelyPath?.cumulativeEarnings || 0) / 100000}L.`;
    }
    
    return 'I can answer questions about: future doors opened/closed, pivot difficulty, or what your career looks like in 5 years.';
  }
}
