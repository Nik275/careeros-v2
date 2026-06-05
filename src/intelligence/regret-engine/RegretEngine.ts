/**
 * Regret Engine
 * 
 * The Regret Engine predicts potential future regrets for career decisions.
 * It analyzes career paths and identifies which decisions might lead to
 * regret based on psychological research and career outcome data.
 * 
 * Architecture Principle:
 *   Regret is a key signal in career decision-making. By predicting potential
 *   regrets BEFORE they happen, we can guide students toward decisions that
 *   minimize future regret.
 * 
 * Key Concepts:
 *   - RegretPrediction: A predicted future regret for a specific decision
 *   - RegretType: Categories of career regrets (missed opportunities, value conflicts, etc.)
 *   - RegretScore: Overall regret risk for a path (0.0 = low risk, 1.0 = high risk)
 *   - Mitigation: Strategies to reduce predicted regret
 * 
 * Inputs:
 *   - StudentBelief: The student's profile (values are especially important)
 *   - CareerPath: The path being evaluated
 *   - HistoricalData: Past career outcomes and reported regrets
 * 
 * Outputs:
 *   - RegretPrediction[]: List of predicted regrets with likelihood and severity
 *   - RegretScore: Overall regret risk score
 *   - MitigationStrategies: Ways to reduce regret risk
 * 
 * Dependencies:
 *   - StudentBelief (reads from - especially values and constraints)
 *   - CareerPath (analyzes)
 *   - PathCascade (optionally uses for alternative path comparison)
 * 
 * Future Expansion:
 *   - Integration with longitudinal career outcome data
 *   - Machine learning models trained on reported regrets
 *   - Personalized regret prediction based on similar profiles
 *   - Real-time regret monitoring as careers progress
 */

import {
  StudentBelief,
  CareerPath,
  CareerNode,
  RegretPrediction,
  RegretType,
  Evidence,
  EvidenceSource,
  EntityId,
  ConfidenceScore,
  Result,
  AsyncResult,
  Value,
  Constraint,
} from '../types';

import { queryStudentBelief } from '../student-model/StudentBelief';

/**
 * Configuration for the Regret Engine.
 */
export interface RegretEngineConfig {
  /** Time horizon for regret prediction (years) */
  predictionHorizon: number;
  
  /** Minimum likelihood to report a regret */
  minLikelihoodThreshold: number;
  
  /** Whether to include mitigable regrets only */
  mitigableOnly: boolean;
  
  /** Weight for value-based regrets */
  valueRegretWeight: number;
  
  /** Weight for opportunity-based regrets */
  opportunityRegretWeight: number;
  
  /** Weight for stagnation-based regrets */
  stagnationRegretWeight: number;
}

/**
 * Default configuration for regret prediction.
 */
export const DEFAULT_REGRET_CONFIG: RegretEngineConfig = {
  predictionHorizon: 10,
  minLikelihoodThreshold: 0.3,
  mitigableOnly: false,
  valueRegretWeight: 0.35,
  opportunityRegretWeight: 0.35,
  stagnationRegretWeight: 0.30,
};

/**
 * Result of regret analysis.
 */
export interface RegretAnalysisResult {
  /** Predicted regrets for this path */
  predictions: RegretPrediction[];
  
  /** Overall regret risk score (0.0 = low, 1.0 = high) */
  overallRegretRisk: ConfidenceScore;
  
  /** Regret risk by category */
  riskByCategory: Map<RegretType, ConfidenceScore>;
  
  /** Mitigation strategies */
  mitigations: RegretMitigation[];
  
  /** Comparison to alternative paths */
  alternativeComparison?: AlternativePathComparison;
  
  /** Confidence in this analysis */
  confidence: ConfidenceScore;
}

/**
 * A strategy to mitigate a predicted regret.
 */
export interface RegretMitigation {
  /** Which regret this mitigates */
  targetRegretId: EntityId;
  
  /** Description of the mitigation strategy */
  strategy: string;
  
  /** How effective this mitigation is (0.0 - 1.0) */
  effectiveness: ConfidenceScore;
  
  /** Effort required to implement */
  effortRequired: 'LOW' | 'MEDIUM' | 'HIGH';
  
  /** When to implement this mitigation */
  timing: 'IMMEDIATE' | 'EARLY_CAREER' | 'ONGOING' | 'LATER';
  
  /** Specific actions to take */
  actions: string[];
}

/**
 * Comparison of regret risk between paths.
 */
export interface AlternativePathComparison {
  /** Path being compared */
  alternativePathId: EntityId;
  
  /** Regret risk of alternative */
  alternativeRegretRisk: ConfidenceScore;
  
  /** Difference in risk (positive = alternative has lower risk) */
  riskDifference: number;
  
  /** Why the alternative has different risk */
  reasoning: string;
}

/**
 * Historical regret data point.
 * 
 * In production, this would come from a database of career outcomes.
 */
export interface HistoricalRegretData {
  /** Career or path ID */
  targetId: EntityId;
  
  /** Type of regret reported */
  regretType: RegretType;
  
  /** How many people reported this regret */
  count: number;
  
  /** Average severity (0.0 - 1.0) */
  averageSeverity: ConfidenceScore;
  
  /** Years after career start when regret manifested */
  averageTimeToManifest: number;
  
  /** Profile characteristics of people who reported this */
  commonProfileTraits: string[];
}

/**
 * The Regret Engine.
 * 
 * This engine analyzes career paths and predicts which decisions might lead to
 * future regret. It uses psychological models, historical data, and the student's
 * values to make these predictions.
 */
export class RegretEngine {
  private config: RegretEngineConfig;
  private historicalData: HistoricalRegretData[];

  constructor(
    historicalData: HistoricalRegretData[] = [],
    config: Partial<RegretEngineConfig> = {}
  ) {
    this.historicalData = historicalData;
    this.config = { ...DEFAULT_REGRET_CONFIG, ...config };
  }

  /**
   * Analyze a career path for potential regrets.
   * 
   * This is the main entry point for regret prediction.
   */
  async analyzePath(
    path: CareerPath,
    studentBelief: StudentBelief,
    alternativePaths?: CareerPath[]
  ): AsyncResult<RegretAnalysisResult> {
    try {
      const query = queryStudentBelief(studentBelief);
      
      // Analyze different types of regrets
      const predictions: RegretPrediction[] = [];
      
      // 1. Missed Opportunity Regrets
      const missedOpportunityRegrets = this.analyzeMissedOpportunities(
        path,
        query.getMotivations(),
        query.getValues()
      );
      predictions.push(...missedOpportunityRegrets);
      
      // 2. Value Conflict Regrets
      const valueConflictRegrets = this.analyzeValueConflicts(
        path,
        query.getValues(),
        query.getNonNegotiableValues()
      );
      predictions.push(...valueConflictRegrets);
      
      // 3. Unrealized Potential Regrets
      const unrealizedPotentialRegrets = this.analyzeUnrealizedPotential(
        path,
        query.getStrengths()
      );
      predictions.push(...unrealizedPotentialRegrets);
      
      // 4. Lifestyle Mismatch Regrets
      const lifestyleMismatchRegrets = this.analyzeLifestyleMismatch(
        path,
        query.getLifestylePreferences()
      );
      predictions.push(...lifestyleMismatchRegrets);
      
      // 5. Stagnation Regrets
      const stagnationRegrets = this.analyzeStagnationRisk(path);
      predictions.push(...stagnationRegrets);
      
      // 6. Financial Regrets
      const financialRegrets = this.analyzeFinancialRegrets(
        path,
        query.getConstraints()
      );
      predictions.push(...financialRegrets);
      
      // Filter by likelihood threshold
      const filteredPredictions = predictions.filter(
        p => p.likelihood >= this.config.minLikelihoodThreshold
      );
      
      // Sort by risk (likelihood * severity)
      filteredPredictions.sort((a, b) => 
        (b.likelihood * b.severity) - (a.likelihood * a.severity)
      );
      
      // Calculate overall regret risk
      const overallRegretRisk = this.calculateOverallRegretRisk(filteredPredictions);
      
      // Calculate risk by category
      const riskByCategory = this.calculateRiskByCategory(filteredPredictions);
      
      // Generate mitigations
      const mitigations = this.generateMitigations(filteredPredictions, path);
      
      // Compare to alternatives if provided
      let alternativeComparison: AlternativePathComparison | undefined;
      if (alternativePaths && alternativePaths.length > 0) {
        alternativeComparison = await this.compareToAlternatives(
          path,
          alternativePaths[0],
          studentBelief
        );
      }
      
      // Calculate confidence in analysis
      const confidence = this.calculateAnalysisConfidence(filteredPredictions, studentBelief);

      return {
        success: true,
        data: {
          predictions: filteredPredictions,
          overallRegretRisk,
          riskByCategory,
          mitigations,
          alternativeComparison,
          confidence,
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
   * Analyze risk of "missed opportunity" regret.
   * 
   * This occurs when someone chooses a safe path over one that better
   * aligned with their true motivations.
   */
  private analyzeMissedOpportunities(
    path: CareerPath,
    motivations: StudentBelief['motivations'],
    values: StudentBelief['values']
  ): RegretPrediction[] {
    const predictions: RegretPrediction[] = [];
    
    // Check if path satisfies top motivations
    const topMotivations = motivations
      .filter(m => m.strength > 0.7)
      .sort((a, b) => b.strength - a.strength);
    
    for (const motivation of topMotivations.slice(0, 2)) {
      // Check if any node in the path satisfies this motivation
      const satisfied = path.nodes.some(node => 
        this.careerSatisfiesMotivation(node, motivation)
      );
      
      if (!satisfied) {
        const evidence: Evidence = {
          id: `evidence_missed_opportunity_${motivation.id}`,
          source: EvidenceSource.AI_INFERENCE,
          rawData: JSON.stringify({ motivationId: motivation.id, pathId: path.id }),
          timestamp: Date.now(),
          confidence: motivation.strength,
          explanation: `Top motivation "${motivation.name}" is not satisfied by any career in this path`,
        };
        
        predictions.push({
          id: `regret_missed_opportunity_${motivation.id}_${Date.now()}`,
          targetId: path.id,
          targetType: 'path',
          regretType: RegretType.MISSED_OPPORTUNITY,
          likelihood: motivation.strength * 0.8, // High likelihood if strong motivation not met
          severity: motivation.strength,
          timeHorizon: 5, // Typically manifests around 5 years
          reasoning: `You may regret not pursuing a career that satisfies your strong motivation for "${motivation.name}". This path doesn't appear to fulfill this core drive.`,
          evidence: [evidence],
          mitigation: `Consider exploring side projects or later career pivots that incorporate ${motivation.name.toLowerCase()}. Alternatively, look for ways to satisfy this motivation outside of work.`,
        });
      }
    }
    
    return predictions;
  }

  /**
   * Analyze risk of value conflict regret.
   * 
   * This occurs when a career requires compromising on important values.
   */
  private analyzeValueConflicts(
    path: CareerPath,
    values: StudentBelief['values'],
    nonNegotiableValues: Value[]
  ): RegretPrediction[] {
    const predictions: RegretPrediction[] = [];
    
    // Check non-negotiable values first (higher risk)
    for (const value of nonNegotiableValues) {
      const conflicts = path.nodes.filter(node => 
        this.careerConflictsWithValue(node, value)
      );
      
      if (conflicts.length > 0) {
        const evidence: Evidence = {
          id: `evidence_value_conflict_${value.id}`,
          source: EvidenceSource.AI_INFERENCE,
          rawData: JSON.stringify({ valueId: value.id, conflictingNodes: conflicts.map(n => n.id) }),
          timestamp: Date.now(),
          confidence: value.importance,
          explanation: `Non-negotiable value "${value.name}" conflicts with ${conflicts.length} careers in path`,
        };
        
        predictions.push({
          id: `regret_value_conflict_${value.id}_${Date.now()}`,
          targetId: path.id,
          targetType: 'path',
          regretType: RegretType.WRONG_VALUES,
          likelihood: value.importance * 0.9,
          severity: value.importance,
          timeHorizon: 2, // Value conflicts manifest quickly
          reasoning: `This path may require compromising on "${value.name}", which you identified as non-negotiable. This is a significant source of potential regret.`,
          evidence: [evidence],
          mitigation: `Reconsider this path or negotiate specific terms that protect your ${value.name.toLowerCase()}. If already committed, set boundaries early.`,
        });
      }
    }
    
    // Check other important values
    const importantValues = values
      .filter(v => v.importance > 0.7 && !v.isNonNegotiable);
    
    for (const value of importantValues) {
      const conflicts = path.nodes.filter(node => 
        this.careerConflictsWithValue(node, value)
      );
      
      if (conflicts.length > path.nodes.length / 2) {
        // More than half the path conflicts with this value
        const evidence: Evidence = {
          id: `evidence_value_conflict_${value.id}`,
          source: EvidenceSource.AI_INFERENCE,
          rawData: JSON.stringify({ valueId: value.id, conflictRatio: conflicts.length / path.nodes.length }),
          timestamp: Date.now(),
          confidence: value.importance * 0.7,
          explanation: `Important value "${value.name}" conflicts with majority of careers in path`,
        };
        
        predictions.push({
          id: `regret_value_conflict_${value.id}_${Date.now()}`,
          targetId: path.id,
          targetType: 'path',
          regretType: RegretType.WRONG_VALUES,
          likelihood: value.importance * 0.6,
          severity: value.importance * 0.8,
          timeHorizon: 4,
          reasoning: `Multiple careers in this path may compromise your value of "${value.name}". While not non-negotiable, this could lead to dissatisfaction over time.`,
          evidence: [evidence],
          mitigation: `Identify specific aspects of ${value.name.toLowerCase()} that matter most and seek compromises. Consider which nodes in the path are most problematic.`,
        });
      }
    }
    
    return predictions;
  }

  /**
   * Analyze risk of unrealized potential regret.
   * 
   * This occurs when a career doesn't leverage a person's key strengths.
   */
  private analyzeUnrealizedPotential(
    path: CareerPath,
    strengths: StudentBelief['strengths']
  ): RegretPrediction[] {
    const predictions: RegretPrediction[] = [];
    
    // Identify top strengths
    const topStrengths = strengths
      .filter(s => s.level > 0.7)
      .sort((a, b) => b.level - a.level)
      .slice(0, 3);
    
    for (const strength of topStrengths) {
      // Check if strength is utilized in path
      const utilized = path.nodes.some(node => 
        this.careerUtilizesStrength(node, strength)
      );
      
      if (!utilized) {
        const evidence: Evidence = {
          id: `evidence_unrealized_potential_${strength.id}`,
          source: EvidenceSource.AI_INFERENCE,
          rawData: JSON.stringify({ strengthId: strength.id, pathId: path.id }),
          timestamp: Date.now(),
          confidence: strength.level * 0.7,
          explanation: `Top strength "${strength.name}" is not utilized in any career in path`,
        };
        
        predictions.push({
          id: `regret_unrealized_potential_${strength.id}_${Date.now()}`,
          targetId: path.id,
          targetType: 'path',
          regretType: RegretType.UNREALIZED_POTENTIAL,
          likelihood: strength.level * 0.6,
          severity: strength.level * 0.7,
          timeHorizon: 7, // Takes time to realize potential is wasted
          reasoning: `Your strength in "${strength.name}" may go underutilized in this path. You might later regret not choosing a career that leverages this capability.`,
          evidence: [evidence],
          mitigation: `Look for ways to apply ${strength.name.toLowerCase()} in your role, or consider specializations within this path that utilize this strength.`,
        });
      }
    }
    
    return predictions;
  }

  /**
   * Analyze risk of lifestyle mismatch regret.
   */
  private analyzeLifestyleMismatch(
    path: CareerPath,
    preferences: StudentBelief['lifestylePreferences']
  ): RegretPrediction[] {
    const predictions: RegretPrediction[] = [];
    
    // Check work environment preferences
    const workEnvPrefs = preferences.filter(p => p.category === 'work_environment');
    
    for (const pref of workEnvPrefs) {
      const mismatches = path.nodes.filter(node => 
        this.careerMismatchesLifestyle(node, pref)
      );
      
      if (mismatches.length > 0) {
        const evidence: Evidence = {
          id: `evidence_lifestyle_mismatch_${pref.id}`,
          source: EvidenceSource.AI_INFERENCE,
          rawData: JSON.stringify({ preferenceId: pref.id, mismatchCount: mismatches.length }),
          timestamp: Date.now(),
          confidence: pref.importance * 0.6,
          explanation: `Lifestyle preference "${pref.name}" conflicts with ${mismatches.length} careers`,
        };
        
        predictions.push({
          id: `regret_lifestyle_mismatch_${pref.id}_${Date.now()}`,
          targetId: path.id,
          targetType: 'path',
          regretType: RegretType.LIFESTYLE_MISMATCH,
          likelihood: pref.importance * 0.5,
          severity: pref.importance * 0.6,
          timeHorizon: 3,
          reasoning: `The work environment in this path may not match your preference for "${pref.preference}". This could affect your day-to-day satisfaction.`,
          evidence: [evidence],
          mitigation: `Research specific companies or roles within this path that offer ${pref.preference.toLowerCase()}. Consider negotiating for flexibility.`,
        });
      }
    }
    
    return predictions;
  }

  /**
   * Analyze risk of stagnation regret.
   * 
   * This occurs when a career path doesn't offer growth or learning opportunities.
   */
  private analyzeStagnationRisk(path: CareerPath): RegretPrediction[] {
    const predictions: RegretPrediction[] = [];
    
    // Check if path has clear advancement
    const stagnationRisk = path.nodes.reduce((risk, node) => {
      const hasAdvancement = node.trajectory?.hasClearAdvancement ?? true;
      return risk + (hasAdvancement ? 0 : 0.3);
    }, 0) / path.nodes.length;
    
    if (stagnationRisk > 0.3) {
      const evidence: Evidence = {
        id: `evidence_stagnation_${path.id}`,
        source: EvidenceSource.AI_INFERENCE,
        rawData: JSON.stringify({ pathId: path.id, stagnationRisk }),
        timestamp: Date.now(),
        confidence: stagnationRisk,
        explanation: `Path shows ${(stagnationRisk * 100).toFixed(0)}% stagnation risk based on trajectory analysis`,
      };
      
      predictions.push({
        id: `regret_stagnation_${path.id}_${Date.now()}`,
        targetId: path.id,
        targetType: 'path',
        regretType: RegretType.STAGNATION,
        likelihood: stagnationRisk,
        severity: stagnationRisk * 0.8,
        timeHorizon: 8,
        reasoning: `This path may not offer sufficient growth or learning opportunities over time. You might regret feeling "stuck" in your career.`,
        evidence: [evidence],
        mitigation: `Identify specific skills to develop within this path. Plan for lateral moves or specializations that create growth opportunities.`,
      });
    }
    
    return predictions;
  }

  /**
   * Analyze risk of financial regret.
   */
  private analyzeFinancialRegrets(
    path: CareerPath,
    constraints: StudentBelief['constraints']
  ): RegretPrediction[] {
    const predictions: RegretPrediction[] = [];
    
    // Check for financial constraints
    const financialConstraints = constraints.filter(c => c.type === 'financial');
    
    for (const constraint of financialConstraints) {
      // Check if path meets financial requirements
      const meetsRequirements = path.nodes.every(node => 
        this.careerMeetsFinancialRequirement(node, constraint)
      );
      
      if (!meetsRequirements) {
        const evidence: Evidence = {
          id: `evidence_financial_${constraint.id}`,
          source: EvidenceSource.AI_INFERENCE,
          rawData: JSON.stringify({ constraintId: constraint.id, pathId: path.id }),
          timestamp: Date.now(),
          confidence: constraint.severity,
          explanation: `Financial constraint "${constraint.name}" may not be met by this path`,
        };
        
        predictions.push({
          id: `regret_financial_${constraint.id}_${Date.now()}`,
          targetId: path.id,
          targetType: 'path',
          regretType: RegretType.FINANCIAL_REGRET,
          likelihood: constraint.severity * 0.7,
          severity: constraint.severity,
          timeHorizon: 4,
          reasoning: `This path may not meet your financial requirements: "${constraint.description}". Financial stress could lead to career regret.`,
          evidence: [evidence],
          mitigation: `Research higher-paying specializations within this path. Consider geographic arbitrage or side income opportunities.`,
        });
      }
    }
    
    return predictions;
  }

  /**
   * Generate mitigation strategies for predicted regrets.
   */
  private generateMitigations(
    predictions: RegretPrediction[],
    path: CareerPath
  ): RegretMitigation[] {
    const mitigations: RegretMitigation[] = [];
    
    for (const prediction of predictions) {
      // Generate specific mitigation based on regret type
      switch (prediction.regretType) {
        case RegretType.MISSED_OPPORTUNITY:
          mitigations.push({
            targetRegretId: prediction.id,
            strategy: 'Create alternative outlets for unmet motivations',
            effectiveness: 0.6,
            effortRequired: 'MEDIUM',
            timing: 'ONGOING',
            actions: [
              'Pursue side projects that satisfy the motivation',
              'Join communities related to the interest area',
              'Plan for a later career pivot',
            ],
          });
          break;
          
        case RegretType.WRONG_VALUES:
          mitigations.push({
            targetRegretId: prediction.id,
            strategy: 'Establish boundaries and negotiate terms',
            effectiveness: prediction.severity > 0.8 ? 0.4 : 0.7,
            effortRequired: 'HIGH',
            timing: 'IMMEDIATE',
            actions: [
              'Clearly define non-negotiable boundaries',
              'Negotiate specific terms before accepting offers',
              'Create exit plan if boundaries cannot be met',
            ],
          });
          break;
          
        case RegretType.UNREALIZED_POTENTIAL:
          mitigations.push({
            targetRegretId: prediction.id,
            strategy: 'Find creative applications of strengths',
            effectiveness: 0.7,
            effortRequired: 'MEDIUM',
            timing: 'EARLY_CAREER',
            actions: [
              'Identify unique applications of strengths in current role',
              'Seek specializations that leverage strengths',
              'Develop complementary skills that enhance strengths',
            ],
          });
          break;
          
        case RegretType.LIFESTYLE_MISMATCH:
          mitigations.push({
            targetRegretId: prediction.id,
            strategy: 'Negotiate flexibility and find compatible employers',
            effectiveness: 0.75,
            effortRequired: 'MEDIUM',
            timing: 'IMMEDIATE',
            actions: [
              'Research company culture before accepting offers',
              'Negotiate for specific lifestyle accommodations',
              'Build skills that enable lifestyle flexibility',
            ],
          });
          break;
          
        case RegretType.STAGNATION:
          mitigations.push({
            targetRegretId: prediction.id,
            strategy: 'Create growth opportunities through skill development',
            effectiveness: 0.8,
            effortRequired: 'MEDIUM',
            timing: 'ONGOING',
            actions: [
              'Set personal learning goals independent of role',
              'Seek lateral moves that create new challenges',
              'Build portfolio of projects that demonstrate growth',
            ],
          });
          break;
          
        case RegretType.FINANCIAL_REGRET:
          mitigations.push({
            targetRegretId: prediction.id,
            strategy: 'Optimize earnings through specialization and negotiation',
            effectiveness: 0.65,
            effortRequired: 'HIGH',
            timing: 'ONGOING',
            actions: [
              'Identify highest-paying specializations in the field',
              'Develop negotiation skills for salary discussions',
              'Consider geographic arbitrage or remote opportunities',
            ],
          });
          break;
          
        default:
          mitigations.push({
            targetRegretId: prediction.id,
            strategy: 'Regular reflection and course correction',
            effectiveness: 0.5,
            effortRequired: 'LOW',
            timing: 'ONGOING',
            actions: [
              'Schedule quarterly career reflection sessions',
              'Build network for alternative opportunities',
              'Maintain financial flexibility for potential pivots',
            ],
          });
      }
    }
    
    return mitigations;
  }

  /**
   * Compare regret risk between two paths.
   */
  private async compareToAlternatives(
    path: CareerPath,
    alternative: CareerPath,
    studentBelief: StudentBelief
  ): Promise<AlternativePathComparison> {
    const pathAnalysis = await this.analyzePath(path, studentBelief);
    const altAnalysis = await this.analyzePath(alternative, studentBelief);
    
    if (!pathAnalysis.success || !altAnalysis.success) {
      return {
        alternativePathId: alternative.id,
        alternativeRegretRisk: 0.5,
        riskDifference: 0,
        reasoning: 'Unable to compare paths due to analysis error',
      };
    }
    
    const pathRisk = pathAnalysis.data.overallRegretRisk;
    const altRisk = altAnalysis.data.overallRegretRisk;
    const difference = pathRisk - altRisk; // Positive = alternative has lower risk
    
    let reasoning: string;
    if (difference > 0.2) {
      reasoning = `The alternative path has significantly lower regret risk (${(difference * 100).toFixed(0)}% lower). Consider exploring this option.`;
    } else if (difference < -0.2) {
      reasoning = `This path has lower regret risk than the alternative (${(Math.abs(difference) * 100).toFixed(0)}% lower). This is a strong consideration in favor of this path.`;
    } else {
      reasoning = `Both paths have similar regret risk profiles. Other factors should drive your decision.`;
    }
    
    return {
      alternativePathId: alternative.id,
      alternativeRegretRisk: altRisk,
      riskDifference: difference,
      reasoning,
    };
  }

  /**
   * Calculate overall regret risk from predictions.
   */
  private calculateOverallRegretRisk(predictions: RegretPrediction[]): ConfidenceScore {
    if (predictions.length === 0) return 0;
    
    // Weighted average of risk scores (likelihood * severity)
    const totalRisk = predictions.reduce((sum, p) => 
      sum + (p.likelihood * p.severity), 0
    );
    
    return Math.min(totalRisk / predictions.length, 1.0);
  }

  /**
   * Calculate regret risk by category.
   */
  private calculateRiskByCategory(
    predictions: RegretPrediction[]
  ): Map<RegretType, ConfidenceScore> {
    const byCategory = new Map<RegretType, number[]>();
    
    for (const prediction of predictions) {
      const risks = byCategory.get(prediction.regretType) || [];
      risks.push(prediction.likelihood * prediction.severity);
      byCategory.set(prediction.regretType, risks);
    }
    
    const result = new Map<RegretType, ConfidenceScore>();
    
    for (const [type, risks] of byCategory) {
      const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
      result.set(type, avgRisk);
    }
    
    return result;
  }

  /**
   * Calculate confidence in the analysis.
   */
  private calculateAnalysisConfidence(
    predictions: RegretPrediction[],
    studentBelief: StudentBelief
  ): ConfidenceScore {
    const query = queryStudentBelief(studentBelief);
    
    // Higher confidence with more complete belief data
    const beliefCompleteness = Math.min(
      (query.getMotivations().length * 0.1) +
      (query.getStrengths().length * 0.1) +
      (query.getValues().length * 0.15) +
      (query.getPersonalityTraits().length * 0.1) +
      (query.getLifestylePreferences().length * 0.1),
      1.0
    );
    
    // Higher confidence with more historical data
    const dataConfidence = Math.min(this.historicalData.length * 0.01, 0.3);
    
    // Higher confidence with more predictions (up to a point)
    const predictionConfidence = Math.min(predictions.length * 0.05, 0.2);
    
    return Math.min(beliefCompleteness + dataConfidence + predictionConfidence, 1.0);
  }

  // Placeholder methods for career evaluation
  // In production, these would use actual career data
  
  private careerSatisfiesMotivation(career: CareerNode, motivation: { id: string }): boolean {
    return Math.random() > 0.5; // Placeholder
  }
  
  private careerConflictsWithValue(career: CareerNode, value: { id: string }): boolean {
    return Math.random() < 0.2; // Placeholder
  }
  
  private careerUtilizesStrength(career: CareerNode, strength: { id: string }): boolean {
    return Math.random() > 0.4; // Placeholder
  }
  
  private careerMismatchesLifestyle(career: CareerNode, preference: { id: string }): boolean {
    return Math.random() < 0.3; // Placeholder
  }
  
  private careerMeetsFinancialRequirement(
    career: CareerNode, 
    constraint: { id: string }
  ): boolean {
    return Math.random() > 0.3; // Placeholder
  }
}

/**
 * Factory function to create a RegretEngine.
 */
export function createRegretEngine(
  historicalData?: HistoricalRegretData[],
  config?: Partial<RegretEngineConfig>
): RegretEngine {
  return new RegretEngine(historicalData, config);
}
