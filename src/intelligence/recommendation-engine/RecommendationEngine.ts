/**
 * Recommendation Engine
 * 
 * The Recommendation Engine is the final output layer of the CareerOS Intelligence System.
 * It takes inputs from all other engines (StudentBelief, DecisionCoalition, PathCascade,
 * RegretEngine) and produces actionable, personalized career recommendations.
 * 
 * Architecture Principle:
 *   Recommendations are NOT generated directly from assessment answers. They are
 *   the result of a multi-stage pipeline:
 *   
 *   Assessment Answers → StudentBelief → [DecisionCoalition, PathCascade, RegretEngine]
 *   → RecommendationEngine → CareerRecommendation
 * 
 *   This ensures recommendations are:
 *   - Based on a rich understanding of the student (StudentBelief)
 *   - Evaluated from multiple perspectives (DecisionCoalition)
 *   - Consider long-term trajectories (PathCascade)
 *   - Account for potential regrets (RegretEngine)
 *   - Explainable and confidence-scored
 * 
 * Key Concepts:
 *   - CareerRecommendation: The final recommendation output
 *   - RecommendationReasoning: Detailed explanation of why this recommendation was made
 *   - Confidence Scoring: How certain we are in the recommendation
 *   - Next Steps: Actionable guidance for the student
 * 
 * Inputs:
 *   - StudentBelief: The student's profile
 *   - PathCascadeResult: Generated and scored career paths
 *   - RegretAnalysisResult: Regret predictions for paths
 *   - CoalitionResult: Voting results from different perspectives
 * 
 * Outputs:
 *   - CareerRecommendation[]: Ranked recommendations with full reasoning
 *   - RecommendationSummary: High-level summary for the student
 *   - ActionPlan: Concrete next steps
 * 
 * Dependencies:
 *   - StudentBelief (reads from)
 *   - DecisionCoalition (optionally uses for scoring)
 *   - PathCascade (uses for path generation)
 *   - RegretEngine (uses for risk assessment)
 * 
 * Future Expansion:
 *   - A/B testing of recommendation strategies
 *   - Personalized explanation styles
 *   - Integration with job market APIs for real-time data
 *   - Mentor system integration for human-in-the-loop validation
 */

import {
  StudentBelief,
  CareerRecommendation,
  RecommendationReasoning,
  RecommendationConcern,
  NextStep,
  PathScores,
  EntityId,
  ConfidenceScore,
  Result,
  AsyncResult,
  Motivation,
  Strength,
  Value,
  CareerPath as EvaluationCareerPath,
  CareerNode as EvaluationCareerNode,
  CareerCategory,
  WorkEnvironmentType,
  EntryRequirementType,
} from '../types';

// Import graph types from path-cascade (different from types/index.ts CareerPath/CareerNode)
import { CareerPath, CareerNode, PathMetrics } from '../path-cascade/CareerGraph';

import { queryStudentBelief } from '../student-model/StudentBelief';
import { PathCascadeResult } from '../path-cascade/PathCascadeEngine';
import { RegretAnalysisResult } from '../regret-engine/RegretEngine';

/**
 * Configuration for the Recommendation Engine.
 */
export interface RecommendationEngineConfig {
  /** Number of recommendations to generate */
  numRecommendations: number;
  
  /** Minimum overall confidence for a recommendation */
  minConfidence: number;
  
  /** Maximum regret risk allowed for a recommendation */
  maxRegretRisk: number;
  
  /** Whether to include alternative paths in recommendations */
  includeAlternatives: boolean;
  
  /** Whether to include detailed reasoning */
  includeDetailedReasoning: boolean;
  
  /** Whether to include concerns and caveats */
  includeConcerns: boolean;
  
  /** Style of explanation (affects tone and detail level) */
  explanationStyle: 'CONCISE' | 'DETAILED' | 'NARRATIVE';
}

/**
 * Default configuration.
 */
export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationEngineConfig = {
  numRecommendations: 3,
  minConfidence: 0.5,
  maxRegretRisk: 0.7,
  includeAlternatives: true,
  includeDetailedReasoning: true,
  includeConcerns: true,
  explanationStyle: 'DETAILED',
};

/**
 * Input to the recommendation generation process.
 */
export interface RecommendationInput {
  /** Student belief model */
  studentBelief: StudentBelief;
  
  /** Generated paths from PathCascade */
  pathResults: PathCascadeResult;
  
  /** Regret analysis for paths (optional) */
  regretResults?: Map<EntityId, RegretAnalysisResult>;
  
  /** Coalition results (optional) */
  // coalitionResults?: CoalitionResult;
}

/**
 * Result of recommendation generation.
 */
export interface RecommendationEngineResult {
  /** Ranked recommendations */
  recommendations: CareerRecommendation[];
  
  /** Summary of the recommendation set */
  summary: RecommendationSummary;
  
  /** Statistics about the generation process */
  statistics: RecommendationStatistics;
  
  /** Any warnings or issues */
  warnings: RecommendationWarning[];
}

/**
 * Summary of recommendations for the student.
 */
export interface RecommendationSummary {
  /** Overall theme of recommendations */
  theme: string;
  
  /** Key insight about the student */
  keyInsight: string;
  
  /** What all recommendations have in common */
  commonElements: string[];
  
  /** What differentiates the recommendations */
  differentiatingFactors: string[];
  
  /** Confidence in the recommendation set */
  overallConfidence: ConfidenceScore;
  
  /** Suggested starting point */
  suggestedStartingPoint: string;
}

/**
 * Statistics about recommendation generation.
 */
export interface RecommendationStatistics {
  /** Number of paths evaluated */
  pathsEvaluated: number;
  
  /** Number of recommendations generated */
  recommendationsGenerated: number;
  
  /** Number filtered by confidence */
  filteredByConfidence: number;
  
  /** Number filtered by regret risk */
  filteredByRegretRisk: number;
  
  /** Average confidence of recommendations */
  averageConfidence: number;
  
  /** Average regret risk of recommendations */
  averageRegretRisk: number;
  
  /** Time taken to generate (ms) */
  generationTimeMs: number;
}

/**
 * Warning from recommendation generation.
 */
export interface RecommendationWarning {
  /** Type of warning */
  type: 'LOW_CONFIDENCE' | 'HIGH_REGRET_RISK' | 'INSUFFICIENT_DATA' | 'CONFLICTING_SIGNALS';
  
  /** Description */
  description: string;
  
  /** Severity (0.0 - 1.0) */
  severity: ConfidenceScore;
  
  /** Suggested action */
  suggestedAction: string;
}

/**
 * The Recommendation Engine.
 * 
 * This engine synthesizes inputs from all other engines to produce
 * final, actionable career recommendations.
 */
export class RecommendationEngine {
  private config: RecommendationEngineConfig;

  constructor(config: Partial<RecommendationEngineConfig> = {}) {
    this.config = { ...DEFAULT_RECOMMENDATION_CONFIG, ...config };
  }

  /**
   * Generate career recommendations.
   * 
   * This is the main entry point for the recommendation engine.
   */
  async generateRecommendations(
    input: RecommendationInput
  ): AsyncResult<RecommendationEngineResult> {
    const startTime = Date.now();
    
    try {
      const query = queryStudentBelief(input.studentBelief);
      
      // Step 1: Score and rank paths
      const scoredPaths = this.scorePaths(
        input.pathResults.paths,
        input.studentBelief,
        input.regretResults
      );
      
      // Step 2: Filter paths by quality criteria
      const filteredPaths = this.filterPaths(scoredPaths);
      
      // Step 3: Generate recommendations from top paths
      const recommendations: CareerRecommendation[] = [];
      const warnings: RecommendationWarning[] = [];
      
      for (let i = 0; i < Math.min(filteredPaths.length, this.config.numRecommendations); i++) {
        const path = filteredPaths[i];
        const regretResult = input.regretResults?.get(path.id);
        
        const recommendation = await this.createRecommendation(
          path,
          input.studentBelief,
          regretResult,
          i + 1
        );
        
        recommendations.push(recommendation);
      }
      
      // Step 4: Generate summary
      const summary = this.generateSummary(
        recommendations,
        input.studentBelief,
        query.getMotivations(),
        query.getStrengths(),
        query.getValues()
      );
      
      // Step 5: Generate statistics
      const statistics: RecommendationStatistics = {
        pathsEvaluated: input.pathResults.paths.length,
        recommendationsGenerated: recommendations.length,
        filteredByConfidence: scoredPaths.filter(p => 
          this.calculatePathConfidence(p.path, input.studentBelief) < this.config.minConfidence
        ).length,
        filteredByRegretRisk: scoredPaths.filter(p => {
          const regret = input.regretResults?.get(p.path.id);
          return regret && regret.overallRegretRisk > this.config.maxRegretRisk;
        }).length,
        averageConfidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / 
          (recommendations.length || 1),
        averageRegretRisk: recommendations.reduce((sum, r) => {
          const regret = input.regretResults?.get(r.path.id);
          return sum + (regret?.overallRegretRisk || 0);
        }, 0) / (recommendations.length || 1),
        generationTimeMs: Date.now() - startTime,
      };
      
      // Step 6: Generate warnings
      if (recommendations.length < this.config.numRecommendations) {
        warnings.push({
          type: 'INSUFFICIENT_DATA',
          description: `Only generated ${recommendations.length} of ${this.config.numRecommendations} requested recommendations`,
          severity: 0.4,
          suggestedAction: 'Consider gathering more assessment data or expanding career database',
        });
      }
      
      if (statistics.averageConfidence < 0.6) {
        warnings.push({
          type: 'LOW_CONFIDENCE',
          description: 'Average recommendation confidence is below threshold',
          severity: 0.6,
          suggestedAction: 'Recommend additional assessment questions to improve confidence',
        });
      }
      
      return {
        success: true,
        data: {
          recommendations,
          summary,
          statistics,
          warnings,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Score paths based on multiple factors.
   */
  private scorePaths(
    paths: CareerPath[],
    studentBelief: StudentBelief,
    regretResults?: Map<EntityId, RegretAnalysisResult>
  ): Array<{ path: CareerPath; score: number }> {
    return paths.map(path => {
      // Calculate base score from path metrics if scores not provided
      const baseScore = path.scores?.overall ?? this.calculateBaseScore(path);

      // Adjust for regret risk
      const regretResult = regretResults?.get(path.id);
      const regretPenalty = regretResult ?
        regretResult.overallRegretRisk * 0.3 : 0;

      // Adjust for confidence
      const confidence = this.calculatePathConfidence(path, studentBelief);
      const confidenceBonus = confidence * 0.1;

      const finalScore = baseScore - regretPenalty + confidenceBonus;

      return { path, score: Math.max(0, finalScore) };
    });
  }

  /**
   * Calculate base score from path metrics when scores are not provided.
   */
  private calculateBaseScore(path: CareerPath): number {
    // Use path metrics to calculate a base score
    const probabilityWeight = 0.3;
    const optionalityWeight = 0.3;
    const reversibilityWeight = 0.2;
    const riskWeight = 0.2;

    const probabilityScore = path.metrics?.pathProbability ?? 0.5;
    const optionalityScore = path.metrics?.optionality ?? 0.5;
    const reversibilityScore = path.metrics?.reversibility ?? 0.5;
    const riskScore = 1 - (path.metrics?.riskScore ?? 0.5); // Invert risk

    return (
      probabilityScore * probabilityWeight +
      optionalityScore * optionalityWeight +
      reversibilityScore * reversibilityWeight +
      riskScore * riskWeight
    );
  }

  /**
   * Filter paths by quality criteria.
   */
  private filterPaths(
    scoredPaths: Array<{ path: CareerPath; score: number }>
  ): CareerPath[] {
    // Sort by score
    scoredPaths.sort((a, b) => b.score - a.score);
    
    // Filter by minimum score threshold
    const minScore = 0.3;
    
    return scoredPaths
      .filter(sp => sp.score >= minScore)
      .map(sp => sp.path);
  }

  /**
   * Create a full recommendation from a path.
   */
  private async createRecommendation(
    path: CareerPath,
    studentBelief: StudentBelief,
    regretResult: RegretAnalysisResult | undefined,
    rank: number
  ): Promise<CareerRecommendation> {
    const query = queryStudentBelief(studentBelief);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(
      path,
      studentBelief,
      query.getMotivations(),
      query.getStrengths(),
      query.getValues()
    );
    
    // Generate concerns
    const concerns = this.generateConcerns(path, regretResult);
    
    // Generate next steps
    const nextSteps = this.generateNextSteps(path, studentBelief);
    
    // Calculate confidence
    const confidence = this.calculatePathConfidence(path, studentBelief);
    
    // Determine contributing engines
    const contributingEngines = [
      'PathCascade',
      'StudentBelief',
      ...(regretResult ? ['RegretEngine'] : []),
    ];
    
    // Convert CareerGraph CareerPath to types/index.ts CareerPath
    const evaluationPath: EvaluationCareerPath = this.convertToEvaluationPath(path, studentBelief);

    return {
      id: `recommendation_${path.id}_${Date.now()}`,
      studentId: studentBelief.studentId,
      studentBeliefId: studentBelief.id,
      path: evaluationPath,
      rank,
      confidence,
      reasoning,
      concerns,
      nextSteps,
      generatedAt: Date.now(),
      contributingEngines,
    };
  }

  /**
   * Generate detailed reasoning for a recommendation.
   */
  private generateReasoning(
    path: CareerPath,
    studentBelief: StudentBelief,
    motivations: Motivation[],
    strengths: Strength[],
    values: Value[]
  ): RecommendationReasoning {
    // Get top motivations, strengths, values
    const topMotivations = motivations
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2);
    
    const topStrengths = strengths
      .sort((a, b) => b.level - a.level)
      .slice(0, 2);
    
    const topValues = values
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 2);
    
    // Generate motivation alignment reasoning
    const motivationAlignment = topMotivations.length > 0
      ? `This path aligns with your motivation for ${topMotivations.map(m => m.name).join(' and ')}. The ${path.nodes[0].name} role provides opportunities to ${this.describeMotivationFulfillment(topMotivations[0])}, while the progression to ${path.nodes[path.nodes.length - 1].name} deepens this fulfillment.`
      : 'This path offers multiple avenues for motivation fulfillment across different dimensions.';
    
    // Generate strength alignment reasoning
    const strengthAlignment = topStrengths.length > 0
      ? `Your strengths in ${topStrengths.map(s => s.name).join(' and ')} are well-utilized throughout this path. Starting with ${path.nodes[0].name}, you\'ll apply ${topStrengths[0].name.toLowerCase()}, and as you progress, ${topStrengths[1]?.name.toLowerCase() || 'these skills'} become increasingly important.`
      : 'This path leverages a diverse set of capabilities that align with your profile.';
    
    // Generate value alignment reasoning
    const valueAlignment = topValues.length > 0
      ? `This path respects your values of ${topValues.map(v => v.name).join(' and ')}. The career trajectory naturally accommodates ${topValues[0].name.toLowerCase()}, and the progression offers increasing alignment with ${topValues[1]?.name.toLowerCase() || 'your core values'}.`
      : 'This path is structured to honor your core values throughout the career progression.';
    
    // Generate feasibility reasoning
    const totalYears = path.totalYears ?? path.totalTime ?? 0;
    const feasibilityReasoning = `The entry requirements for ${path.nodes[0].name} are achievable given your current profile. The transitions between roles follow natural progression patterns, with each step building on the previous one. The total timeline of ${totalYears} years is reasonable for this level of career development.`;
    
    // Generate regret reasoning
    const regretReasoning = `This path minimizes common career regrets by providing clear growth trajectories, maintaining alignment with your stated preferences, and offering flexibility at key decision points. The progression allows for course corrections if your interests evolve.`;
    
    // Generate summary
    const pathYears = path.totalYears ?? path.totalTime ?? 0;
    const summary = `Based on your profile, the ${path.name} path offers a strong balance of motivation fulfillment, strength utilization, and value alignment. The ${pathYears}-year progression from ${path.nodes[0].name} to ${path.nodes[path.nodes.length - 1].name} provides both immediate opportunities and long-term growth.`;
    
    return {
      motivationAlignment,
      strengthAlignment,
      valueAlignment,
      feasibilityReasoning,
      regretReasoning,
      summary,
    };
  }

  /**
   * Generate concerns for a recommendation.
   */
  private generateConcerns(
    path: CareerPath,
    regretResult: RegretAnalysisResult | undefined
  ): RecommendationConcern[] {
    const concerns: RecommendationConcern[] = [];
    
    // Add concerns from regret analysis
    if (regretResult) {
      for (const prediction of regretResult.predictions.slice(0, 2)) {
        concerns.push({
          topic: prediction.regretType,
          description: prediction.reasoning,
          severity: prediction.likelihood * prediction.severity,
          mitigation: prediction.mitigation,
        });
      }
    }
    
    // Add generic concerns if no regret data
    if (concerns.length === 0) {
      concerns.push({
        topic: 'Career Evolution',
        description: 'Career interests and market conditions may change over the timeline of this path.',
        severity: 0.3,
        mitigation: 'Regularly reassess your path and be prepared to adapt. Build transferable skills that provide flexibility.',
      });
    }
    
    return concerns;
  }

  /**
   * Generate next steps for a recommendation.
   */
  private generateNextSteps(
    path: CareerPath,
    studentBelief: StudentBelief
  ): NextStep[] {
    const steps: NextStep[] = [];
    const firstNode = path.nodes[0];
    
    // Step 1: Research the starting career
    steps.push({
      action: `Deep-dive research on ${firstNode.name}`,
      reasoning: 'Understanding the day-to-day reality of this role is essential before committing.',
      priority: 1,
      estimatedTime: '2-3 weeks',
    });
    
    // Step 2: Identify skill gaps
    const requiredSkills = (firstNode as unknown as { prerequisites?: Array<{ type: string; description: string }> }).prerequisites || [];
    if (requiredSkills.length > 0) {
      steps.push({
        action: `Develop ${requiredSkills.slice(0, 2).map(s => s.description).join(' and ')}`,
        reasoning: 'These capabilities are essential for success in the starting role.',
        priority: 2,
        estimatedTime: '1-3 months',
      });
    }

    // Step 3: Network building
    const nodeCategory = (firstNode as unknown as { category?: string }).category || 'this field';
    steps.push({
      action: `Connect with professionals in ${nodeCategory}`,
      reasoning: 'Real-world insights from practitioners will validate or refine your interest.',
      priority: 3,
      estimatedTime: '1-2 months',
    });
    
    // Step 4: Entry strategy
    steps.push({
      action: `Plan your entry into ${firstNode.name}`,
      reasoning: 'Whether through education, entry-level roles, or transition, you need a concrete plan.',
      priority: 4,
      estimatedTime: '3-6 months',
    });
    
    return steps;
  }

  /**
   * Generate a summary of recommendations.
   */
  private generateSummary(
    recommendations: CareerRecommendation[],
    studentBelief: StudentBelief,
    motivations: Motivation[],
    strengths: Strength[],
    values: Value[]
  ): RecommendationSummary {
    // Determine theme based on top recommendations
    const themes = this.identifyCommonThemes(recommendations);
    
    // Generate key insight
    const topMotivation = motivations.sort((a, b) => b.strength - a.strength)[0];
    const topStrength = strengths.sort((a, b) => b.level - a.level)[0];
    
    const keyInsight = topMotivation && topStrength
      ? `Your strong motivation for ${topMotivation.name.toLowerCase()}, combined with your capability in ${topStrength.name.toLowerCase()}, points toward careers where you can both excel and find deep satisfaction.`
      : 'Your profile suggests a need for careers that offer both challenge and alignment with your core drivers.';
    
    // Identify common elements
    const commonElements = themes.length > 0 
      ? themes 
      : ['All recommendations offer growth potential', 'All align with your core values'];
    
    // Identify differentiating factors
    const differentiatingFactors = recommendations.length > 1
      ? [
          'Different risk profiles and timelines',
          'Varying emphasis on technical vs. interpersonal skills',
          'Alternative entry points and progression speeds',
        ]
      : ['This is your top recommendation based on current data'];
    
    // Calculate overall confidence
    const overallConfidence = recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
      : 0;
    
    // Suggest starting point
    const suggestedStartingPoint = recommendations.length > 0
      ? `Begin with deep research on ${recommendations[0].path.nodes[0].name} to validate your interest.`
      : 'Consider gathering more information to refine recommendations.';
    
    return {
      theme: themes[0] || 'Growth-Oriented Paths',
      keyInsight,
      commonElements,
      differentiatingFactors,
      overallConfidence,
      suggestedStartingPoint,
    };
  }

  /**
   * Calculate confidence in a path recommendation.
   */
  private calculatePathConfidence(
    path: CareerPath,
    studentBelief: StudentBelief
  ): ConfidenceScore {
    // Base confidence from path scores or calculate from metrics
    let confidence = path.scores?.overall ?? this.calculateBaseConfidence(path);

    // Adjust for belief confidence
    confidence *= studentBelief.overallConfidence;

    // Adjust for number of nodes (more nodes = more uncertainty)
    const nodeUncertainty = Math.min((path.nodes.length - 2) * 0.05, 0.2);
    confidence *= (1 - nodeUncertainty);

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate base confidence from path metrics when scores not available.
   */
  private calculateBaseConfidence(path: CareerPath): number {
    const metrics = path.metrics;
    if (!metrics) return 0.5;

    // Combine probability, optionality, and reversibility
    return (
      (metrics.pathProbability ?? 0.5) * 0.4 +
      (metrics.optionality ?? 0.5) * 0.3 +
      (metrics.reversibility ?? 0.5) * 0.3
    );
  }

  /**
   * Identify common themes across recommendations.
   */
  private identifyCommonThemes(recommendations: CareerRecommendation[]): string[] {
    const themes: string[] = [];

    // Check for category themes (using category field which exists in both types)
    const categories = new Set(recommendations.flatMap(r =>
      r.path.nodes.map(n => (n as unknown as { category?: string }).category).filter(Boolean)
    ));

    if (categories.size === 1) {
      themes.push(`All paths are in ${Array.from(categories)[0]} roles`);
    } else if (categories.size > 1 && categories.size <= 3) {
      themes.push(`Paths span ${categories.size} related categories`);
    }

    return themes;
  }

  /**
   * Convert CareerGraph CareerPath to types/index.ts CareerPath.
   */
  private convertToEvaluationPath(
    path: CareerPath,
    studentBelief: StudentBelief
  ): EvaluationCareerPath {
    // Convert CareerGraph CareerNodes to EvaluationCareerNodes
    const evaluationNodes: EvaluationCareerNode[] = path.nodes.map(node => ({
      id: node.id,
      name: node.name,
      description: node.description,
      industry: (node as unknown as { category?: string }).category || 'General',
      category: CareerCategory.TECHNICAL, // Default category
      requiredStrengths: [],
      alignedValues: [],
      lifestyleProfile: {
        workEnvironment: WorkEnvironmentType.OFFICE,
        scheduleFlexibility: 0.5,
        travelRequirement: 0.5,
        typicalTeamSize: { min: 3, max: 10 },
        remotePossibility: 0.5,
        workPace: 3,
      },
      entryRequirements: (node as unknown as { prerequisites?: Array<{ type: string; description: string; isHardRequirement?: boolean }> }).prerequisites?.map(p => ({
        type: EntryRequirementType.DEGREE,
        description: p.description,
        isRequired: p.isHardRequirement ?? false,
        typicalTimeToAcquire: '1-2 years',
      })) || [],
      trajectory: {
        yearsToSenior: 5,
        yearsToLeadership: 8,
        hasClearAdvancement: true,
        pivotOptions: [],
        specializationOptions: [],
      },
      marketData: {
        demandLevel: Math.round((node.popularity ?? 0.5) * 5),
        growthProjection: (node as unknown as { outcomes?: { growthPotential?: number } }).outcomes?.growthPotential ?? 0.5,
        salaryRange: {
          entry: (node as unknown as { outcomes?: { averageSalary?: number } }).outcomes?.averageSalary ?? 500000,
          mid: ((node as unknown as { outcomes?: { averageSalary?: number } }).outcomes?.averageSalary ?? 500000) * 1.5,
          senior: ((node as unknown as { outcomes?: { averageSalary?: number } }).outcomes?.averageSalary ?? 500000) * 2.5,
        },
        geographicAvailability: {
          isGlobal: false,
          inDemandRegions: ['India'],
          remoteCommon: false,
        },
        entryBarrier: 3,
      },
      metadata: {
        lastUpdated: Date.now(),
        dataSource: 'career-graph',
        dataConfidence: 0.7,
      },
    }));

    // Create evaluation path
    return {
      id: path.id,
      name: path.name,
      nodes: evaluationNodes,
      edges: [], // Evaluation path doesn't use edges
      totalYears: path.totalYears ?? path.totalTime ?? 0,
      studentBeliefId: studentBelief.id,
      scores: path.scores ?? {
        overall: this.calculateBaseScore(path),
        motivationAlignment: 0.5,
        strengthUtilization: 0.5,
        valueSatisfaction: 0.5,
        feasibility: 0.5,
        predictedRegret: 0.3,
      },
      isValidated: false,
      generatedAt: Date.now(),
    };
  }

  /**
   * Describe how a motivation is fulfilled.
   */
  private describeMotivationFulfillment(motivation: Motivation): string {
    const descriptions: Record<string, string> = {
      'Creative Expression': 'express creativity and build new things',
      'Making a Difference': 'create positive impact and help others',
      'Becoming Excellent': 'develop deep expertise and mastery',
      'Freedom & Autonomy': 'control your work and decisions',
      'Stability & Security': 'build a stable and predictable career',
      'Recognition & Status': 'achieve recognition for your contributions',
    };
    
    return descriptions[motivation.name] || `fulfill your drive for ${motivation.name.toLowerCase()}`;
  }
}

/**
 * Factory function to create a RecommendationEngine.
 */
export function createRecommendationEngine(
  config?: Partial<RecommendationEngineConfig>
): RecommendationEngine {
  return new RecommendationEngine(config);
}

/**
 * Convenience function to generate recommendations in one call.
 */
export async function generateRecommendations(
  input: RecommendationInput,
  config?: Partial<RecommendationEngineConfig>
): AsyncResult<RecommendationEngineResult> {
  const engine = createRecommendationEngine(config);
  return engine.generateRecommendations(input);
}
