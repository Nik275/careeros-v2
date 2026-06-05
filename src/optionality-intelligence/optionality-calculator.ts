/**
 * CareerOS Optionality Intelligence Engine - Optionality Calculator
 *
 * Phase D.3: Optionality Intelligence Engine
 *
 * Calculates optionality scores across all dimensions:
 * Career Flexibility, Pivot Potential, Transferable Skills,
 * Industry Mobility, Geographic Mobility, Entrepreneurial Potential
 *
 * @module optionality-calculator
 * @version 1.0.0
 */

import type {
  OptionalityBreakdown,
  OptionalityCalculationResult,
  OptionalityIntelligenceConfig,
  DimensionScore,
  DimensionFinding,
  TransferableSkillsAssessment,
  IndustryMobility,
  GeographicMobility,
  EntrepreneurialPotential,
  TransferableSkill,
  AccessibleIndustry,
} from './optionality-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';

/**
 * Calculator for optionality scores.
 */
export class OptionalityCalculator {
  /** Configuration */
  private config: OptionalityIntelligenceConfig;

  /**
   * Creates a new OptionalityCalculator.
   *
   * @param config - Configuration
   */
  constructor(config: OptionalityIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Calculates complete optionality breakdown.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Complete optionality breakdown
   */
  calculateOptionalityBreakdown(
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): OptionalityBreakdown {
    const weights = this.config.dimensionWeights;

    return {
      careerFlexibility: this.calculateCareerFlexibility(career, fitResult, weights.careerFlexibility),
      pivotPotential: this.calculatePivotPotential(career, fitResult, weights.pivotPotential),
      transferableSkills: this.calculateTransferableSkills(career, weights.transferableSkills),
      industryMobility: this.calculateIndustryMobility(career, weights.industryMobility),
      geographicMobility: this.calculateGeographicMobility(career, weights.geographicMobility),
      entrepreneurialPotential: this.calculateEntrepreneurialPotential(career, weights.entrepreneurialPotential),
    };
  }

  /**
   * Calculates overall optionality score.
   *
   * @param breakdown - Optionality breakdown
   * @returns Overall score and confidence
   */
  calculateOverallOptionality(breakdown: OptionalityBreakdown): OptionalityCalculationResult {
    const weights = this.config.dimensionWeights;

    const careerFlexibilityScore = breakdown.careerFlexibility.score;
    const pivotPotentialScore = breakdown.pivotPotential.score;
    const transferableSkillsScore = breakdown.transferableSkills.score;
    const industryMobilityScore = breakdown.industryMobility.score;
    const geographicMobilityScore = breakdown.geographicMobility.score;
    const entrepreneurialPotentialScore = breakdown.entrepreneurialPotential.score;

    // Weighted average
    const overallOptionality = Math.round(
      careerFlexibilityScore * weights.careerFlexibility +
      pivotPotentialScore * weights.pivotPotential +
      transferableSkillsScore * weights.transferableSkills +
      industryMobilityScore * weights.industryMobility +
      geographicMobilityScore * weights.geographicMobility +
      entrepreneurialPotentialScore * weights.entrepreneurialPotential
    );

    // Confidence is weighted average of dimension confidences
    const confidence = Math.round(
      breakdown.careerFlexibility.confidence * weights.careerFlexibility +
      breakdown.pivotPotential.confidence * weights.pivotPotential +
      breakdown.transferableSkills.confidence * weights.transferableSkills +
      breakdown.industryMobility.confidence * weights.industryMobility +
      breakdown.geographicMobility.confidence * weights.geographicMobility +
      breakdown.entrepreneurialPotential.confidence * weights.entrepreneurialPotential
    );

    return {
      overallOptionality,
      dimensions: {
        careerFlexibility: careerFlexibilityScore,
        pivotPotential: pivotPotentialScore,
        transferableSkills: transferableSkillsScore,
        industryMobility: industryMobilityScore,
        geographicMobility: geographicMobilityScore,
        entrepreneurialPotential: entrepreneurialPotentialScore,
      },
      confidence,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculates career flexibility score.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Career flexibility dimension score
   */
  private calculateCareerFlexibility(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): DimensionScore {
    const advantages = career.careerAdvantages;

    // Career mobility score
    const mobilityScore = advantages.careerMobility?.score ?? 50;

    // Optionality score
    const optionalityScore = advantages.optionality?.score ?? 50;

    // Transferability score
    const transferabilityScore = advantages.transferability?.score ?? 50;

    // Future relevance (indicates continued options)
    const futureRelevance = advantages.futureRelevance?.score ?? 50;

    // Calculate overall score
    const score = Math.round(
      mobilityScore * 0.3 +
      optionalityScore * 0.3 +
      transferabilityScore * 0.25 +
      futureRelevance * 0.15
    );

    // Confidence based on evidence quality
    const confidence = career.evidence.overallConfidence;

    const findings = this.generateCareerFlexibilityFindings(
      mobilityScore,
      optionalityScore,
      transferabilityScore,
      futureRelevance
    );

    return {
      score,
      confidence,
      weight,
      findings,
    };
  }

  /**
   * Calculates pivot potential score.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param weight - Dimension weight
   * @returns Pivot potential dimension score
   */
  private calculatePivotPotential(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    weight: number
  ): DimensionScore {
    const advantages = career.careerAdvantages;
    const risks = career.careerRisks;

    // Transferability indicates ease of pivot
    const transferability = advantages.transferability?.score ?? 50;

    // Optionality score
    const optionality = advantages.optionality?.score ?? 50;

    // Education barrier inversely affects pivot potential
    const educationBarrier = risks.educationBarrier?.score ?? 0;
    const educationFactor = Math.max(100 - educationBarrier, 0);

    // Skill transferability from fit
    const skillTransferability = fitResult.breakdown.cognitive.score;

    // Calculate overall score
    const score = Math.round(
      transferability * 0.35 +
      optionality * 0.25 +
      educationFactor * 0.2 +
      skillTransferability * 0.2
    );

    const confidence = Math.round(
      (career.evidence.overallConfidence + fitResult.confidence.overall) / 2
    );

    const findings = this.generatePivotPotentialFindings(
      transferability,
      optionality,
      educationBarrier,
      skillTransferability
    );

    return {
      score,
      confidence,
      weight,
      findings,
    };
  }

  /**
   * Calculates transferable skills score.
   *
   * @param career - Career intelligence
   * @param weight - Dimension weight
   * @returns Transferable skills dimension score
   */
  private calculateTransferableSkills(
    career: CareerIntelligence,
    weight: number
  ): DimensionScore {
    const cognitiveDemands = career.cognitiveDemands;
    const workEnvironment = career.workEnvironment;

    // Cognitive skills (highly transferable)
    const analyticalTransferability = cognitiveDemands.analyticalDemand?.score ?? 50;
    const creativeTransferability = cognitiveDemands.creativeDemand?.score ?? 50;
    const systematicTransferability = cognitiveDemands.systematicDemand?.score ?? 50;
    const verbalTransferability = cognitiveDemands.verbalDemand?.score ?? 50;

    // Social skills (highly transferable)
    const peopleIntensity = workEnvironment.peopleIntensity?.score ?? 50;
    const leadershipTransferability = workEnvironment.leadershipOpportunity?.score ?? 50;

    // Calculate cognitive portability
    const cognitivePortability = Math.round(
      (analyticalTransferability + creativeTransferability + systematicTransferability + verbalTransferability) / 4
    );

    // Calculate social portability
    const socialPortability = Math.round(
      peopleIntensity * 0.6 + leadershipTransferability * 0.4
    );

    // Overall transferable skills score
    const score = Math.round(
      cognitivePortability * 0.5 +
      socialPortability * 0.35 +
      leadershipTransferability * 0.15
    );

    const confidence = 70; // Consistent confidence for skills assessment

    const findings = this.generateTransferableSkillsFindings(
      cognitivePortability,
      socialPortability,
      leadershipTransferability
    );

    return {
      score,
      confidence,
      weight,
      findings,
    };
  }

  /**
   * Calculates industry mobility score.
   *
   * @param career - Career intelligence
   * @param weight - Dimension weight
   * @returns Industry mobility dimension score
   */
  private calculateIndustryMobility(
    career: CareerIntelligence,
    weight: number
  ): DimensionScore {
    const advantages = career.careerAdvantages;
    const metadata = career.metadata;

    // Transferability is key for industry mobility
    const transferability = advantages.transferability?.score ?? 50;

    // Career mobility also important
    const careerMobility = advantages.careerMobility?.score ?? 50;

    // Industry-specific constraint
    // Technical/engineering roles tend to be more industry-specific
    // Business/strategy roles more transferable
    const isTechnicalRole = this.isTechnicalRole(metadata.category);
    const industryConstraint = isTechnicalRole ? 20 : 0;

    // Calculate score
    const score = Math.round(
      transferability * 0.5 +
      careerMobility * 0.3 +
      (100 - industryConstraint) * 0.2
    );

    const confidence = career.evidence.overallConfidence;

    const findings = this.generateIndustryMobilityFindings(
      transferability,
      careerMobility,
      isTechnicalRole,
      metadata.industry
    );

    return {
      score,
      confidence,
      weight,
      findings,
    };
  }

  /**
   * Calculates geographic mobility score.
   *
   * @param career - Career intelligence
   * @param weight - Dimension weight
   * @returns Geographic mobility dimension score
   */
  private calculateGeographicMobility(
    career: CareerIntelligence,
    weight: number
  ): DimensionScore {
    const lifestyleChars = career.lifestyleCharacteristics;
    const metadata = career.metadata;

    // Location flexibility
    const locationFlexibility = lifestyleChars.locationFlexibility?.score ?? 50;

    // Remote potential estimation based on category
    const remotePotential = this.estimateRemotePotential(metadata.category);

    // Global portability - influenced by industry and category
    const globalPortability = this.estimateGlobalPortability(metadata.industry, metadata.category);

    // Calculate score
    const score = Math.round(
      locationFlexibility * 0.4 +
      remotePotential * 0.35 +
      globalPortability * 0.25
    );

    const confidence = 65;

    const findings = this.generateGeographicMobilityFindings(
      locationFlexibility,
      remotePotential,
      globalPortability
    );

    return {
      score,
      confidence,
      weight,
      findings,
    };
  }

  /**
   * Calculates entrepreneurial potential score.
   *
   * @param career - Career intelligence
   * @param weight - Dimension weight
   * @returns Entrepreneurial potential dimension score
   */
  private calculateEntrepreneurialPotential(
    career: CareerIntelligence,
    weight: number
  ): DimensionScore {
    const advantages = career.careerAdvantages;
    const motivationalDemands = career.motivationalDemands;
    const workEnvironment = career.workEnvironment;
    const metadata = career.metadata;

    // Optionality indicates entrepreneurial paths
    const optionality = advantages.optionality?.score ?? 50;

    // Autonomy demand correlates with founder fit
    const autonomyDemand = motivationalDemands.autonomyDemand?.score ?? 50;

    // Leadership opportunity indicates management skills
    const leadership = workEnvironment.leadershipOpportunity?.score ?? 50;

    // Industry entrepreneurship potential
    const industryEntrepreneurialScore = this.estimateIndustryEntrepreneurialPotential(metadata.industry);

    // Calculate score
    const score = Math.round(
      optionality * 0.3 +
      autonomyDemand * 0.25 +
      leadership * 0.2 +
      industryEntrepreneurialScore * 0.25
    );

    const confidence = 60;

    const findings = this.generateEntrepreneurialFindings(
      optionality,
      autonomyDemand,
      leadership,
      industryEntrepreneurialScore
    );

    return {
      score,
      confidence,
      weight,
      findings,
    };
  }

  /**
   * Generates transferable skills assessment.
   *
   * @param career - Career intelligence
   * @returns Complete transferable skills assessment
   */
  calculateTransferableSkillsAssessment(
    career: CareerIntelligence
  ): TransferableSkillsAssessment {
    const cognitiveDemands = career.cognitiveDemands;
    const workEnvironment = career.workEnvironment;

    // Cognitive skills
    const cognitiveSkills = {
      category: 'Cognitive',
      portability: Math.round(
        ((cognitiveDemands.analyticalDemand?.score ?? 50) +
         (cognitiveDemands.creativeDemand?.score ?? 50) +
         (cognitiveDemands.systematicDemand?.score ?? 50)) / 3
      ),
      keySkills: ['Analytical thinking', 'Creative problem solving', 'Systematic reasoning'],
    };

    // Social skills
    const peopleIntensity = workEnvironment.peopleIntensity?.score ?? 50;
    const leadership = workEnvironment.leadershipOpportunity?.score ?? 50;

    const socialSkills = {
      category: 'Social',
      portability: Math.round(peopleIntensity * 0.7 + leadership * 0.3),
      keySkills: ['Communication', 'Collaboration', 'Leadership'],
    };

    // Technical skills (moderate portability)
    const technicalSkills = {
      category: 'Technical',
      portability: 40, // Technical skills are less portable
      keySkills: ['Domain expertise', 'Technical tools', 'Industry knowledge'],
    };

    // Business skills (high portability)
    const executionIntensity = workEnvironment.executionIntensity?.score ?? 50;
    const businessSkills = {
      category: 'Business',
      portability: Math.round(executionIntensity * 0.6 + leadership * 0.4),
      keySkills: ['Execution', 'Strategy', 'Management'],
    };

    // Calculate overall portability
    const overallPortability = Math.round(
      cognitiveSkills.portability * 0.3 +
      socialSkills.portability * 0.3 +
      technicalSkills.portability * 0.2 +
      businessSkills.portability * 0.2
    );

    // Generate specific transferable skills
    const transferableSkills: TransferableSkill[] = [
      {
        name: 'Problem solving',
        transferability: cognitiveSkills.portability,
        applicableIndustries: ['All industries'],
        applicableCareers: ['Most careers'],
      },
      {
        name: 'Communication',
        transferability: socialSkills.portability,
        applicableIndustries: ['All industries'],
        applicableCareers: ['Most careers'],
      },
      {
        name: 'Leadership',
        transferability: leadership,
        applicableIndustries: ['All industries'],
        applicableCareers: ['Management', 'Executive', 'Team lead'],
      },
      {
        name: 'Project management',
        transferability: executionIntensity,
        applicableIndustries: ['All industries'],
        applicableCareers: ['Operations', 'Product', 'Consulting'],
      },
    ];

    return {
      overallPortability,
      cognitiveSkills,
      socialSkills,
      technicalSkills,
      businessSkills,
      transferableSkills,
    };
  }

  /**
   * Calculates industry mobility assessment.
   *
   * @param career - Career intelligence
   * @returns Complete industry mobility assessment
   */
  calculateIndustryMobility(career: CareerIntelligence): IndustryMobility {
    const advantages = career.careerAdvantages;
    const metadata = career.metadata;

    const transferability = advantages.transferability?.score ?? 50;

    // Generate accessible industries based on current industry
    const accessibleIndustries: AccessibleIndustry[] = this.generateAccessibleIndustries(
      metadata.industry,
      transferability
    );

    // Calculate overall score
    const score = Math.round(
      accessibleIndustries.reduce((sum, ind) => sum + ind.accessibility, 0) /
      Math.max(accessibleIndustries.length, 1)
    );

    // Identify barriers
    const barriers: { type: string; description: string; severity: number }[] = [];

    if (transferability < 50) {
      barriers.push({
        type: 'SKILL_SPECIALIZATION',
        description: 'Highly specialized skills may limit cross-industry movement',
        severity: Math.round(100 - transferability),
      });
    }

    return {
      score,
      currentIndustry: metadata.industry,
      accessibleIndustries,
      barriers,
    };
  }

  /**
   * Calculates geographic mobility assessment.
   *
   * @param career - Career intelligence
   * @returns Complete geographic mobility assessment
   */
  calculateGeographicMobilityDetailed(career: CareerIntelligence): GeographicMobility {
    const lifestyleChars = career.lifestyleCharacteristics;
    const metadata = career.metadata;

    const locationFlexibility = lifestyleChars.locationFlexibility?.score ?? 50;
    const remotePotential = this.estimateRemotePotential(metadata.category);
    const globalPortability = this.estimateGlobalPortability(metadata.industry, metadata.category);

    // Overall score
    const score = Math.round(
      locationFlexibility * 0.4 +
      remotePotential * 0.35 +
      globalPortability * 0.25
    );

    // Location flexibility details
    const locationFlexibilityDetails = {
      canWorkRemote: remotePotential >= 60,
      canWorkHybrid: remotePotential >= 40,
      requiresSpecificLocation: locationFlexibility < 40,
      requiresSpecificRegion: locationFlexibility < 60,
      globalOpportunities: globalPortability >= 60,
    };

    // Constraints
    const constraints: { type: string; description: string; impact: number }[] = [];

    if (locationFlexibility < 40) {
      constraints.push({
        type: 'LOCATION_DEPENDENT',
        description: 'Role requires physical presence in specific location',
        impact: 70,
      });
    }

    if (globalPortability < 40) {
      constraints.push({
        type: 'REGIONAL_LIMITED',
        description: 'Limited global demand for this role',
        impact: 50,
      });
    }

    return {
      score,
      remotePotential,
      globalPortability,
      locationFlexibility: locationFlexibilityDetails,
      constraints,
    };
  }

  /**
   * Calculates entrepreneurial potential assessment.
   *
   * @param career - Career intelligence
   * @returns Complete entrepreneurial potential assessment
   */
  calculateEntrepreneurialPotentialDetailed(career: CareerIntelligence): EntrepreneurialPotential {
    const advantages = career.careerAdvantages;
    const motivationalDemands = career.motivationalDemands;
    const workEnvironment = career.workEnvironment;
    const metadata = career.metadata;

    const optionality = advantages.optionality?.score ?? 50;
    const autonomyDemand = motivationalDemands.autonomyDemand?.score ?? 50;
    const leadership = workEnvironment.leadershipOpportunity?.score ?? 50;
    const industryScore = this.estimateIndustryEntrepreneurialPotential(metadata.industry);

    // Calculate component scores
    const founderFit = Math.round(
      autonomyDemand * 0.4 +
      leadership * 0.3 +
      optionality * 0.3
    );

    const consultingPotential = Math.round(
      advantages.transferability?.score ?? 50 * 0.6 +
      optionality * 0.4
    );

    const freelancePotential = Math.round(
      advantages.transferability?.score ?? 50 * 0.5 +
      autonomyDemand * 0.3 +
      optionality * 0.2
    );

    // Overall score
    const score = Math.round(
      founderFit * 0.35 +
      consultingPotential * 0.3 +
      freelancePotential * 0.2 +
      industryScore * 0.15
    );

    // Startup opportunities
    const startupOpportunities = [
      {
        type: 'Industry startup',
        description: `Launch a business in the ${metadata.industry} sector`,
        viability: industryScore,
        requiredResources: ['Industry expertise', 'Network', 'Capital'],
      },
      {
        type: 'Consulting',
        description: 'Offer consulting services based on expertise',
        viability: consultingPotential,
        requiredResources: ['Expertise', 'Client network', 'Credibility'],
      },
      {
        type: 'Freelance',
        description: 'Work independently on project basis',
        viability: freelancePotential,
        requiredResources: ['Portfolio', 'Client acquisition skills', 'Self-discipline'],
      },
    ];

    // Barriers
    const barriers: { type: string; description: string; severity: number }[] = [];

    if (optionality < 50) {
      barriers.push({
        type: 'LIMITED_PATHWAYS',
        description: 'Few entrepreneurial pathways from this career',
        severity: 60,
      });
    }

    return {
      score,
      founderFit,
      consultingPotential,
      freelancePotential,
      startupOpportunities,
      barriers,
    };
  }

  // Helper methods

  /**
   * Determines if role is technical.
   *
   * @param category - Career category
   * @returns Whether technical
   */
  private isTechnicalRole(category: string): boolean {
    const technicalCategories = ['ENGINEERING', 'TECHNOLOGY', 'RESEARCH', 'SCIENCE'];
    return technicalCategories.some((tc) => category.toUpperCase().includes(tc));
  }

  /**
   * Estimates remote work potential.
   *
   * @param category - Career category
   * @returns Remote potential score
   */
  private estimateRemotePotential(category: string): number {
    const highRemote: string[] = ['SOFTWARE', 'DESIGN', 'WRITING', 'CONSULTING', 'ANALYSIS'];
    const lowRemote: string[] = ['HEALTHCARE', 'MANUFACTURING', 'CONSTRUCTION', 'LABOR'];

    const upperCategory = category.toUpperCase();

    if (highRemote.some((r) => upperCategory.includes(r))) return 80;
    if (lowRemote.some((r) => upperCategory.includes(r))) return 30;
    return 55;
  }

  /**
   * Estimates global portability.
   *
   * @param industry - Industry
   * @param category - Category
   * @returns Global portability score
   */
  private estimateGlobalPortability(industry: string, category: string): number {
    const globalIndustries: string[] = ['TECHNOLOGY', 'FINANCE', 'CONSULTING', 'MARKETING'];
    const upperIndustry = industry.toUpperCase();

    if (globalIndustries.some((gi) => upperIndustry.includes(gi))) {
      return 75;
    }

    // Technical roles more portable
    if (this.isTechnicalRole(category)) {
      return 65;
    }

    return 50;
  }

  /**
   * Estimates entrepreneurial potential by industry.
   *
   * @param industry - Industry
   * @returns Entrepreneurial score
   */
  private estimateIndustryEntrepreneurialPotential(industry: string): number {
    const highEntrepreneurial: string[] = ['TECHNOLOGY', 'FINANCE', 'CONSULTING', 'MARKETING', 'MEDIA'];
    const moderateEntrepreneurial: string[] = ['HEALTHCARE', 'EDUCATION', 'RETAIL'];

    const upperIndustry = industry.toUpperCase();

    if (highEntrepreneurial.some((i) => upperIndustry.includes(i))) return 75;
    if (moderateEntrepreneurial.some((i) => upperIndustry.includes(i))) return 60;
    return 45;
  }

  /**
   * Generates accessible industries list.
   *
   * @param currentIndustry - Current industry
   * @param transferability - Transferability score
   * @returns List of accessible industries
   */
  private generateAccessibleIndustries(
    currentIndustry: string,
    transferability: number
  ): AccessibleIndustry[] {
    const commonTransitions: Record<string, string[]> = {
      TECHNOLOGY: ['Finance', 'Consulting', 'Healthcare', 'Media', 'Retail'],
      FINANCE: ['Technology', 'Consulting', 'Real Estate', 'Insurance'],
      HEALTHCARE: ['Pharmaceuticals', 'Technology', 'Consulting'],
      CONSULTING: ['Technology', 'Finance', 'Healthcare', 'Any industry'],
      MARKETING: ['Technology', 'Media', 'Retail', 'Consumer Goods'],
    };

    const transitions = commonTransitions[currentIndustry.toUpperCase()] ?? ['Consulting', 'Technology'];

    return transitions.map((industry) => ({
      industry,
      accessibility: Math.round(transferability * 0.8),
      transitionPath: `Leverage ${currentIndustry} experience in ${industry} context`,
      difficulty: Math.round(100 - transferability * 0.8),
    }));
  }

  // Finding generation methods

  private generateCareerFlexibilityFindings(
    mobility: number,
    optionality: number,
    transferability: number,
    futureRelevance: number
  ): DimensionFinding[] {
    const findings: DimensionFinding[] = [];

    if (mobility >= 70) {
      findings.push({
        type: 'HIGH_MOBILITY',
        description: 'Strong career mobility enables multiple advancement paths',
        impact: 15,
      });
    }

    if (optionality >= 70) {
      findings.push({
        type: 'HIGH_OPTIONALITY',
        description: 'Multiple career paths remain accessible',
        impact: 15,
      });
    }

    if (transferability >= 70) {
      findings.push({
        type: 'SKILL_PORTABILITY',
        description: 'Transferable skills enable lateral moves',
        impact: 10,
      });
    }

    if (futureRelevance < 50) {
      findings.push({
        type: 'RELEVANCE_RISK',
        description: 'Declining future relevance may limit future options',
        impact: -15,
      });
    }

    return findings;
  }

  private generatePivotPotentialFindings(
    transferability: number,
    optionality: number,
    educationBarrier: number,
    skillTransferability: number
  ): DimensionFinding[] {
    const findings: DimensionFinding[] = [];

    if (transferability >= 70 && optionality >= 60) {
      findings.push({
        type: 'EASY_PIVOT',
        description: 'Pivot to adjacent careers is feasible',
        impact: 20,
      });
    }

    if (educationBarrier > 70) {
      findings.push({
        type: 'EDUCATION_BARRIER',
        description: 'High education requirements limit pivot options',
        impact: -15,
      });
    }

    if (skillTransferability >= 70) {
      findings.push({
        type: 'SKILL_TRANSFER',
        description: 'Skills transfer well to related roles',
        impact: 10,
      });
    }

    return findings;
  }

  private generateTransferableSkillsFindings(
    cognitive: number,
    social: number,
    leadership: number
  ): DimensionFinding[] {
    const findings: DimensionFinding[] = [];

    if (cognitive >= 70) {
      findings.push({
        type: 'COGNITIVE_PORTABILITY',
        description: 'Cognitive skills highly transferable across domains',
        impact: 15,
      });
    }

    if (social >= 70) {
      findings.push({
        type: 'SOCIAL_PORTABILITY',
        description: 'Social skills applicable in many contexts',
        impact: 10,
      });
    }

    if (leadership >= 70) {
      findings.push({
        type: 'LEADERSHIP_TRANSFER',
        description: 'Leadership skills transfer to management roles',
        impact: 10,
      });
    }

    return findings;
  }

  private generateIndustryMobilityFindings(
    transferability: number,
    mobility: number,
    isTechnical: boolean,
    industry: string
  ): DimensionFinding[] {
    const findings: DimensionFinding[] = [];

    if (transferability >= 70) {
      findings.push({
        type: 'CROSS_INDUSTRY',
        description: 'Skills enable cross-industry movement',
        impact: 15,
      });
    }

    if (isTechnical) {
      findings.push({
        type: 'TECHNICAL_SPECIALIZATION',
        description: 'Technical specialization may limit industry options',
        impact: -10,
      });
    }

    findings.push({
      type: 'INDUSTRY_BASE',
      description: `Current industry: ${industry}`,
      impact: 0,
    });

    return findings;
  }

  private generateGeographicMobilityFindings(
    locationFlex: number,
    remote: number,
    global: number
  ): DimensionFinding[] {
    const findings: DimensionFinding[] = [];

    if (remote >= 70) {
      findings.push({
        type: 'REMOTE_FRIENDLY',
        description: 'Remote work enables geographic flexibility',
        impact: 15,
      });
    }

    if (global >= 70) {
      findings.push({
        type: 'GLOBAL_PORTABLE',
        description: 'Skills in demand globally',
        impact: 10,
      });
    }

    if (locationFlex < 40) {
      findings.push({
        type: 'LOCATION_BOUND',
        description: 'Limited geographic flexibility',
        impact: -15,
      });
    }

    return findings;
  }

  private generateEntrepreneurialFindings(
    optionality: number,
    autonomy: number,
    leadership: number,
    industry: number
  ): DimensionFinding[] {
    const findings: DimensionFinding[] = [];

    if (optionality >= 70 && autonomy >= 60) {
      findings.push({
        type: 'FOUNDER_POTENTIAL',
        description: 'Career path enables entrepreneurial opportunities',
        impact: 15,
      });
    }

    if (leadership >= 70) {
      findings.push({
        type: 'MANAGEMENT_SKILLS',
        description: 'Leadership experience supports business building',
        impact: 10,
      });
    }

    if (industry >= 70) {
      findings.push({
        type: 'INDUSTRY_OPPORTUNITY',
        description: 'Industry supports startup creation',
        impact: 10,
      });
    }

    return findings;
  }
}

/**
 * Creates a default optionality calculator.
 *
 * @param config - Optional partial configuration
 * @returns Configured OptionalityCalculator
 */
export function createOptionalityCalculator(
  config?: Partial<OptionalityIntelligenceConfig>
): OptionalityCalculator {
  const fullConfig: OptionalityIntelligenceConfig = {
    ...import('./optionality-types').DEFAULT_OPTIONALITY_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new OptionalityCalculator(fullConfig);
}
