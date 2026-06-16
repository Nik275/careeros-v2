/**
 * CareerOS - Cohort Engine
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Creates and manages student cohorts for outcome analysis.
 *
 * @module cohort-engine
 * @version 1.0.0
 */

import type {
  StudentId,
} from '../types/outcome-tracking-types';
import type {
  CohortEngine,
  Cohort,
  CohortId,
  CreateCohortRequest,
  CreateCohortResult,
  FindCohortsRequest,
  FindCohortsResult,
  AnalyzeCohortRequest,
  AnalyzeCohortResult,
  CohortOutcomeAnalysis,
  CohortComparison,
  CohortInsight,
  CohortRecommendation,
  DimensionBreakdown,
  TrendAnalysis,
  PredictiveFactor,
} from '../types/cohort-engine-types';

/**
 * Cohort Engine Implementation.
 *
 * Groups students by similar characteristics to enable aggregate
 * outcome analysis while preserving privacy.
 */
export class CohortEngineImpl implements CohortEngine {
  private cohorts: Map<CohortId, Cohort> = new Map();
  private studentCohorts: Map<StudentId, CohortId[]> = new Map();

  constructor() {
    // Initialize with predefined cohorts
    this.initializePredefinedCohorts();
  }

  /**
   * Create a new cohort.
   */
  async createCohort(request: CreateCohortRequest): Promise<CreateCohortResult> {
    const cohortId: CohortId = `cohort_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In production, would query database for matching students
    // For now, create cohort with empty membership
    const cohort: Cohort = {
      id: cohortId,
      name: request.name,
      description: request.description,
      type: request.type,
      criteria: request.criteria,
      statistics: {
        memberCount: 0,
        historicalMemberCount: 0,
        averageTimeInCohortDays: 0,
        churnRate: 0,
        outcomes: {
          averageSatisfaction: 0,
          successRate: 0,
          averageTimelineDays: 0,
          averageRegret: 0,
          topCareerPaths: [],
          topDecisions: [],
          outcomeDistribution: {},
        },
        lastUpdatedAt: new Date(),
      },
      membership: {
        count: 0,
        isDynamic: request.isDynamic,
        membershipRules: request.isDynamic ? this.generateMembershipRules(request.criteria) : undefined,
      },
      metadata: {
        createdAt: new Date(),
        createdBy: 'CohortEngine',
        modifiedAt: new Date(),
        version: 1,
        isActive: true,
        purpose: request.purpose,
        privacyClassification: request.privacyClassification || 'INTERNAL',
      },
    };

    this.cohorts.set(cohortId, cohort);

    return {
      cohort,
      initialMemberCount: 0,
      matchingStats: {
        totalStudentsChecked: 0,
        studentsMatched: 0,
        matchRate: 0,
      },
    };
  }

  /**
   * Find cohorts for a student.
   */
  async findCohortsForStudent(request: FindCohortsRequest): Promise<FindCohortsResult> {
    const matchingCohorts: FindCohortsResult['matchingCohorts'] = [];

    for (const cohort of Array.from(this.cohorts.values())) {
      // Skip if filtering by type
      if (request.cohortTypes && !request.cohortTypes.includes(cohort.type)) {
        continue;
      }

      // Calculate match score
      const matchResult = this.calculateCohortMatch(cohort, request.studentProfile);

      if (matchResult.score >= (request.minMatchScore || 0.5)) {
        matchingCohorts.push({
          cohort,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons,
        });
      }
    }

    // Sort by match score
    matchingCohorts.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    const limitedResults = request.maxCohorts
      ? matchingCohorts.slice(0, request.maxCohorts)
      : matchingCohorts;

    return {
      matchingCohorts: limitedResults,
      primaryCohort: limitedResults.length > 0 ? limitedResults[0].cohort : undefined,
      totalChecked: this.cohorts.size,
    };
  }

  /**
   * Analyze cohort outcomes.
   */
  async analyzeCohort(request: AnalyzeCohortRequest): Promise<AnalyzeCohortResult> {
    const cohort = this.cohorts.get(request.cohortId);

    if (!cohort) {
      throw new Error(`Cohort not found: ${request.cohortId}`);
    }

    // In production, would query database for cohort member outcomes
    // For now, return placeholder analysis

    const outcomeAnalysis: CohortOutcomeAnalysis = {
      sampleSize: cohort.statistics.memberCount,
      successMetrics: {
        successRate: cohort.statistics.outcomes.successRate,
        averageSatisfaction: cohort.statistics.outcomes.averageSatisfaction,
        averageRegret: cohort.statistics.outcomes.averageRegret,
        averageTimelineDays: cohort.statistics.outcomes.averageTimelineDays,
      },
      dimensionBreakdowns: this.generateDimensionBreakdowns(request.dimensions),
      trends: this.generateTrendAnalysis(),
      predictiveFactors: this.generatePredictiveFactors(cohort),
    };

    // Generate comparisons
    const comparisons: CohortComparison[] = [];
    if (request.compareWithCohortIds) {
      for (const compareId of request.compareWithCohortIds) {
        const compareCohort = this.cohorts.get(compareId);
        if (compareCohort) {
          comparisons.push(this.compareTwoCohorts(cohort, compareCohort));
        }
      }
    }

    // Generate insights
    const insights = this.generateCohortInsights(cohort, outcomeAnalysis);

    // Generate recommendations
    const recommendations = this.generateCohortRecommendations(cohort, insights);

    return {
      cohort,
      analyzedAt: new Date(),
      outcomes: outcomeAnalysis,
      comparisons,
      insights,
      recommendations,
    };
  }

  /**
   * Get cohort by ID.
   */
  async getCohort(cohortId: CohortId): Promise<Cohort | null> {
    return this.cohorts.get(cohortId) || null;
  }

  /**
   * Update cohort membership.
   */
  async updateCohortMembership(cohortId: CohortId): Promise<Cohort> {
    const cohort = this.cohorts.get(cohortId);

    if (!cohort) {
      throw new Error(`Cohort not found: ${cohortId}`);
    }

    if (!cohort.membership.isDynamic) {
      return cohort;
    }

    // In production, would re-evaluate all students against membership rules
    // For now, just update timestamp

    cohort.metadata.modifiedAt = new Date();
    cohort.metadata.version++;

    return cohort;
  }

  /**
   * List all cohorts.
   */
  async listCohorts(options: {
    types?: import('../types/cohort-engine-types').CohortType[];
    activeOnly?: boolean;
    limit?: number;
  } = {}): Promise<Cohort[]> {
    let cohorts = Array.from(this.cohorts.values());

    if (options.types) {
      cohorts = cohorts.filter(c => options.types!.includes(c.type));
    }

    if (options.activeOnly) {
      cohorts = cohorts.filter(c => c.metadata.isActive);
    }

    if (options.limit) {
      cohorts = cohorts.slice(0, options.limit);
    }

    return cohorts;
  }

  /**
   * Compare multiple cohorts.
   */
  async compareCohorts(
    cohortIds: CohortId[],
    dimensions?: string[]
  ): Promise<CohortComparison[]> {
    const comparisons: CohortComparison[] = [];

    const cohorts = cohortIds
      .map(id => this.cohorts.get(id))
      .filter((c): c is Cohort => c !== undefined);

    for (let i = 0; i < cohorts.length; i++) {
      for (let j = i + 1; j < cohorts.length; j++) {
        comparisons.push(this.compareTwoCohorts(cohorts[i], cohorts[j]));
      }
    }

    return comparisons;
  }

  /**
   * Get cohort insights for a student.
   */
  async getStudentCohortInsights(
    studentId: StudentId,
    cohortIds: CohortId[]
  ): Promise<CohortInsight[]> {
    const insights: CohortInsight[] = [];

    for (const cohortId of cohortIds) {
      const cohort = this.cohorts.get(cohortId);
      if (!cohort) continue;

      // Analyze cohort
      const analysis = await this.analyzeCohort({ cohortId });

      // Generate student-specific insights from cohort analysis
      for (const insight of analysis.insights) {
        insights.push(insight);
      }
    }

    return insights;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializePredefinedCohorts(): void {
    // Founder + Tier 2 City + Engineering
    this.createCohort({
      name: 'Founder Archetype + Tier 2 City + Engineering',
      description: 'Students with founder mindset in tier 2 cities with engineering backgrounds',
      type: 'COMPOSITE',
      criteria: {
        archetype: {
          primaryArchetype: 'FOUNDER',
          requiredTraits: [
            { trait: 'riskTolerance', minScore: 70, maxScore: 100 },
            { trait: 'autonomyPreference', minScore: 75, maxScore: 100 },
          ],
        },
        demographic: {
          cityTier: ['TIER_2'],
          fieldOfStudy: ['ENGINEERING', 'COMPUTER_SCIENCE', 'TECHNOLOGY'],
        },
      },
      isDynamic: true,
      purpose: 'Track outcomes for founder-type engineers in tier 2 cities',
      privacyClassification: 'INTERNAL',
    });

    // Researcher + NEET Aspirant
    this.createCohort({
      name: 'Researcher Archetype + NEET Aspirant',
      description: 'Students with researcher mindset preparing for NEET',
      type: 'COMPOSITE',
      criteria: {
        archetype: {
          primaryArchetype: 'RESEARCHER',
          requiredTraits: [
            { trait: 'analyticalDepth', minScore: 75, maxScore: 100 },
            { trait: 'patience', minScore: 70, maxScore: 100 },
          ],
        },
        decision: {
          decisionTypes: ['NEET_PREPARATION', 'MEDICAL_CAREER_PATH'],
        },
      },
      isDynamic: true,
      purpose: 'Track outcomes for medical aspirants with researcher traits',
      privacyClassification: 'INTERNAL',
    });

    // Builder + Career Switcher
    this.createCohort({
      name: 'Builder Archetype + Career Switcher',
      description: 'Builder-minded students switching careers',
      type: 'COMPOSITE',
      criteria: {
        archetype: {
          primaryArchetype: 'BUILDER',
          requiredTraits: [
            { trait: 'practicalOrientation', minScore: 70, maxScore: 100 },
            { trait: 'executionFocus', minScore: 75, maxScore: 100 },
          ],
        },
        demographic: {
          careerStage: ['MID_CAREER', 'CAREER_TRANSITION'],
        },
        behavioral: {
          actionPatterns: ['SKILL_BUILDING', 'PROJECT_EXECUTION'],
        },
      },
      isDynamic: true,
      purpose: 'Track outcomes for builder-type career switchers',
      privacyClassification: 'INTERNAL',
    });
  }

  private generateMembershipRules(
    criteria: import('../types/cohort-engine-types').CohortCriteria
  ): import('../types/cohort-engine-types').MembershipRule[] {
    const rules: import('../types/cohort-engine-types').MembershipRule[] = [];

    if (criteria.archetype?.primaryArchetype) {
      rules.push({
        ruleId: `rule_archetype_${Date.now()}`,
        description: `Primary archetype is ${criteria.archetype.primaryArchetype}`,
        condition: {
          attribute: 'archetype.primary',
          operator: 'EQUALS',
          value: criteria.archetype.primaryArchetype,
        },
        required: true,
      });
    }

    if (criteria.demographic?.cityTier) {
      rules.push({
        ruleId: `rule_city_${Date.now()}`,
        description: `City tier in [${criteria.demographic.cityTier.join(', ')}]`,
        condition: {
          attribute: 'demographic.cityTier',
          operator: 'IN',
          value: criteria.demographic.cityTier,
        },
        required: true,
      });
    }

    return rules;
  }

  private calculateCohortMatch(
    cohort: Cohort,
    profile: Record<string, unknown>
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    let totalWeight = 0;

    // Check archetype criteria
    if (cohort.criteria.archetype) {
      totalWeight += 1;
      const archetypeMatch = this.checkArchetypeMatch(cohort.criteria.archetype, profile);
      score += archetypeMatch.score;
      if (archetypeMatch.matched) {
        reasons.push(`Matches ${cohort.criteria.archetype.primaryArchetype} archetype`);
      }
    }

    // Check demographic criteria
    if (cohort.criteria.demographic) {
      totalWeight += 1;
      const demoMatch = this.checkDemographicMatch(cohort.criteria.demographic, profile);
      score += demoMatch.score;
      if (demoMatch.matched) {
        reasons.push('Matches demographic criteria');
      }
    }

    // Check behavioral criteria
    if (cohort.criteria.behavioral) {
      totalWeight += 0.5;
      const behavioralMatch = this.checkBehavioralMatch(cohort.criteria.behavioral, profile);
      score += behavioralMatch.score * 0.5;
    }

    // Normalize score
    const normalizedScore = totalWeight > 0 ? score / totalWeight : 0;

    return {
      score: normalizedScore,
      reasons,
    };
  }

  private checkArchetypeMatch(
    criteria: import('../types/cohort-engine-types').ArchetypeCriteria,
    profile: Record<string, unknown>
  ): { score: number; matched: boolean } {
    const profileArchetype = profile['archetype'] as string;

    if (criteria.primaryArchetype && profileArchetype !== criteria.primaryArchetype) {
      return { score: 0, matched: false };
    }

    // Check required traits
    if (criteria.requiredTraits) {
      const traits = profile['traits'] as Record<string, number> || {};
      for (const trait of criteria.requiredTraits) {
        const value = traits[trait.trait] || 0;
        if (value < trait.minScore || value > trait.maxScore) {
          return { score: 0.3, matched: false };
        }
      }
    }

    return { score: 1, matched: true };
  }

  private checkDemographicMatch(
    criteria: import('../types/cohort-engine-types').DemographicCriteria,
    profile: Record<string, unknown>
  ): { score: number; matched: boolean } {
    let matches = 0;
    let checks = 0;

    const demographics = profile['demographics'] as Record<string, unknown> || {};

    if (criteria.cityTier) {
      checks++;
      const cityTier = demographics['cityTier'] as string;
      if (criteria.cityTier.includes(cityTier as 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4')) {
        matches++;
      }
    }

    if (criteria.fieldOfStudy) {
      checks++;
      const field = demographics['fieldOfStudy'] as string;
      if (criteria.fieldOfStudy.includes(field)) {
        matches++;
      }
    }

    if (criteria.educationLevel) {
      checks++;
      const level = demographics['educationLevel'] as string;
      if (criteria.educationLevel.includes(level)) {
        matches++;
      }
    }

    const score = checks > 0 ? matches / checks : 0;
    return { score, matched: score >= 0.5 };
  }

  private checkBehavioralMatch(
    criteria: import('../types/cohort-engine-types').BehavioralCriteria,
    profile: Record<string, unknown>
  ): { score: number; matched: boolean } {
    // Simplified behavioral matching
    return { score: 0.5, matched: true };
  }

  private generateDimensionBreakdowns(
    dimensions?: string[]
  ): Record<string, DimensionBreakdown> {
    const breakdowns: Record<string, DimensionBreakdown> = {};

    const dims = dimensions || [
      'careerProgress',
      'incomeGrowth',
      'skillGrowth',
      'lifeSatisfaction',
      'stressLevels',
      'learningGrowth',
      'careerMobility',
      'goalAchievement',
    ];

    for (const dim of dims) {
      breakdowns[dim] = {
        dimension: dim,
        averageScore: 65 + Math.random() * 20, // Placeholder
        distribution: [
          { range: '0-25', count: 5, percentage: 5 },
          { range: '26-50', count: 15, percentage: 15 },
          { range: '51-75', count: 50, percentage: 50 },
          { range: '76-100', count: 30, percentage: 30 },
        ],
        correlationWithSuccess: 0.6 + Math.random() * 0.3,
      };
    }

    return breakdowns;
  }

  private generateTrendAnalysis(): TrendAnalysis {
    return {
      direction: Math.random() > 0.3 ? 'IMPROVING' : 'STABLE',
      magnitude: 5 + Math.random() * 10,
      periodChanges: [
        {
          period: 'Last 30 days',
          change: 2 + Math.random() * 5,
          significance: 0.8,
        },
        {
          period: 'Last 90 days',
          change: 5 + Math.random() * 10,
          significance: 0.9,
        },
      ],
    };
  }

  private generatePredictiveFactors(cohort: Cohort): PredictiveFactor[] {
    return [
      {
        factor: 'Decision Confidence',
        type: 'DECISION',
        predictiveStrength: 75,
        impactOnSuccess: 0.4,
        significance: 0.001,
      },
      {
        factor: 'Action Completion Rate',
        type: 'ACTION',
        predictiveStrength: 80,
        impactOnSuccess: 0.5,
        significance: 0.0001,
      },
      {
        factor: 'Archetype Alignment',
        type: 'ARCHETYPE',
        predictiveStrength: 65,
        impactOnSuccess: 0.3,
        significance: 0.01,
      },
    ];
  }

  private compareTwoCohorts(cohortA: Cohort, cohortB: Cohort): CohortComparison {
    const outcomeComparisons: CohortComparison['outcomeComparisons'] = [
      {
        dimension: 'successRate',
        thisCohortValue: cohortA.statistics.outcomes.successRate,
        otherCohortValue: cohortB.statistics.outcomes.successRate,
        difference: cohortA.statistics.outcomes.successRate - cohortB.statistics.outcomes.successRate,
        percentageDifference: ((cohortA.statistics.outcomes.successRate - cohortB.statistics.outcomes.successRate) / (cohortB.statistics.outcomes.successRate || 1)) * 100,
        isSignificant: Math.abs(cohortA.statistics.outcomes.successRate - cohortB.statistics.outcomes.successRate) > 10,
      },
      {
        dimension: 'satisfaction',
        thisCohortValue: cohortA.statistics.outcomes.averageSatisfaction,
        otherCohortValue: cohortB.statistics.outcomes.averageSatisfaction,
        difference: cohortA.statistics.outcomes.averageSatisfaction - cohortB.statistics.outcomes.averageSatisfaction,
        percentageDifference: ((cohortA.statistics.outcomes.averageSatisfaction - cohortB.statistics.outcomes.averageSatisfaction) / (cohortB.statistics.outcomes.averageSatisfaction || 1)) * 100,
        isSignificant: Math.abs(cohortA.statistics.outcomes.averageSatisfaction - cohortB.statistics.outcomes.averageSatisfaction) > 10,
      },
    ];

    const significantlyBetter = outcomeComparisons
      .filter(c => c.isSignificant && c.difference > 0)
      .map(c => c.dimension);

    const significantlyWorse = outcomeComparisons
      .filter(c => c.isSignificant && c.difference < 0)
      .map(c => c.dimension);

    const notSignificant = outcomeComparisons
      .filter(c => !c.isSignificant)
      .map(c => c.dimension);

    return {
      comparedCohort: cohortB,
      comparedCohortId: cohortB.id,
      comparedCohortName: cohortB.name,
      outcomeComparisons,
      metrics: {
        successRateDelta: cohortA.statistics.outcomes.successRate - cohortB.statistics.outcomes.successRate,
        satisfactionDelta: cohortA.statistics.outcomes.averageSatisfaction - cohortB.statistics.outcomes.averageSatisfaction,
        timelineDelta: cohortA.statistics.outcomes.averageTimelineDays - cohortB.statistics.outcomes.averageTimelineDays,
        regretDelta: cohortA.statistics.outcomes.averageRegret - cohortB.statistics.outcomes.averageRegret,
      },
      isSignificant: outcomeComparisons.some(c => c.isSignificant),
      keyDifferences: [
        `${cohortA.name} vs ${cohortB.name}`,
        `Success rate difference: ${(cohortA.statistics.outcomes.successRate - cohortB.statistics.outcomes.successRate).toFixed(1)}%`,
      ],
      significanceSummary: {
        significantlyBetter,
        significantlyWorse,
        notSignificant,
      },
    };
  }

  private generateCohortInsights(
    cohort: Cohort,
    outcomeAnalysis: CohortOutcomeAnalysis
  ): CohortInsight[] {
    const insights: CohortInsight[] = [];

    // Success pattern insight
    if (outcomeAnalysis.successMetrics.successRate > 60) {
      insights.push({
        insightId: `insight_success_${cohort.id}_${Date.now()}`,
        cohortId: cohort.id,
        type: 'SUCCESS_PATTERN',
        title: 'Above-Average Success Rate',
        description: `${cohort.name} shows a ${outcomeAnalysis.successMetrics.successRate.toFixed(0)}% success rate, which is above average`,
        supportingData: {
          sampleSize: outcomeAnalysis.sampleSize,
          applicabilityPercentage: 75,
          successRate: outcomeAnalysis.successMetrics.successRate,
          averageOutcomeScore: outcomeAnalysis.successMetrics.averageSatisfaction,
          vsOverallPopulation: {
            successRateDelta: outcomeAnalysis.successMetrics.successRate - 50,
            satisfactionDelta: outcomeAnalysis.successMetrics.averageSatisfaction - 50,
            timelineDelta: 0,
            isSignificant: outcomeAnalysis.sampleSize > 30,
          },
          keyStatistics: {
            confidence: 85,
            effectSize: 0.4,
          },
        },
        recommendations: [
          'Study success factors for replication',
          'Use as benchmark for similar cohorts',
        ],
        confidence: 80,
        generatedAt: new Date(),
      });
    }

    // Predictive factor insights
    for (const factor of outcomeAnalysis.predictiveFactors) {
      if (factor.predictiveStrength > 70) {
        insights.push({
          insightId: `insight_factor_${factor.factor}_${Date.now()}`,
          cohortId: cohort.id,
          type: 'PATTERN',
          title: `Strong Predictive Factor: ${factor.factor}`,
          description: `${factor.factor} has ${factor.predictiveStrength}% predictive strength for success`,
          supportingData: {
            sampleSize: outcomeAnalysis.sampleSize,
            applicabilityPercentage: 60,
            successRate: outcomeAnalysis.successMetrics.successRate,
            averageOutcomeScore: outcomeAnalysis.successMetrics.averageSatisfaction,
            vsOverallPopulation: {
              successRateDelta: 0,
              satisfactionDelta: 0,
              timelineDelta: 0,
              isSignificant: factor.significance < 0.05,
            },
            keyStatistics: {
              predictiveStrength: factor.predictiveStrength,
              impact: factor.impactOnSuccess,
              significance: factor.significance,
            },
          },
          recommendations: [
            `Monitor ${factor.factor} for early intervention`,
            `Include ${factor.factor} in risk assessment`,
          ],
          confidence: factor.predictiveStrength,
          generatedAt: new Date(),
        });
      }
    }

    return insights;
  }

  private generateCohortRecommendations(
    cohort: Cohort,
    insights: CohortInsight[]
  ): CohortRecommendation[] {
    const recommendations: CohortRecommendation[] = [];

    // Focus recommendation for high-performing cohort
    if (cohort.statistics.outcomes.successRate > 70) {
      recommendations.push({
        recommendationId: `rec_focus_${cohort.id}_${Date.now()}`,
        type: 'FOCUS',
        recommendation: 'Focus resources on understanding success drivers',
        expectedImpact: 'Replicate success patterns in similar cohorts',
        implementationApproach: 'Conduct deep-dive analysis of high-performing members',
        priority: 'HIGH',
      });
    }

    // Improve recommendation for low-performing cohort
    if (cohort.statistics.outcomes.successRate < 40) {
      recommendations.push({
        recommendationId: `rec_improve_${cohort.id}_${Date.now()}`,
        type: 'IMPROVE',
        recommendation: 'Implement targeted interventions to improve outcomes',
        expectedImpact: 'Increase success rate by 15-20%',
        implementationApproach: 'Identify and address common failure factors',
        priority: 'HIGH',
      });
    }

    // Leverage insights
    for (const insight of insights.filter(i => typeof i.confidence === 'number' && i.confidence > 75)) {
      recommendations.push({
        recommendationId: `rec_leverage_${insight.insightId}`,
        type: 'LEVERAGE',
        recommendation: `Apply insight: ${insight.title}`,
        expectedImpact: 'Improve recommendations using cohort-specific patterns',
        implementationApproach: insight.recommendations?.[0] || 'Integrate into recommendation engine',
        priority: typeof insight.confidence === 'number' && insight.confidence > 85 ? 'HIGH' : 'MEDIUM',
      });
    }

    return recommendations;
  }
}
