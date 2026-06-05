/**
 * CareerOS - Company Stage Engine
 *
 * Models how careers differ across company stages:
 * - Startup
 * - Growth Stage
 * - Mid-Sized Company
 * - Large Enterprise
 * - Government
 * - Family Business
 *
 * Example: Product Manager at Startup vs Enterprise must be modeled differently.
 *
 * @module company-stage-engine
 * @version 1.0.0
 */

import type {
  CompanyStage,
  CompanyStageVariant,
  StageDifference,
  DailyLifeProfile,
  WorkEnvironmentProfile,
  SatisfactionProfile,
  CareerId,
} from '../types/career-reality-types';
import type { DailyLifeInput } from './daily-life-engine';
import type { WorkEnvironmentInput } from './work-environment-engine';

/** Input for company stage modeling */
export interface CompanyStageInput {
  careerId: CareerId;
  careerTitle: string;
  industry?: string;
}

/** Stage characteristics definition */
interface StageCharacteristics {
  name: string;
  description: string;
  typicalSize: string;
  pace: 'VERY_FAST' | 'FAST' | 'MODERATE' | 'SLOW' | 'VERY_SLOW';
  structure: 'FLAT' | 'MINIMAL' | 'MODERATE' | 'HIERARCHICAL' | 'BUREAUCRATIC';
  stability: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  growthOpportunity: 'MASSIVE' | 'HIGH' | 'MODERATE' | 'LIMITED' | 'MINIMAL';
  riskLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  impactVisibility: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  resourceAvailability: 'SCARCE' | 'LIMITED' | 'ADEQUATE' | 'ABUNDANT' | 'UNLIMITED';
  processMaturity: 'NONE' | 'EMERGING' | 'DEVELOPING' | 'MATURE' | 'RIGID';
}

/** Stage definitions */
const STAGE_DEFINITIONS: Record<CompanyStage, StageCharacteristics> = {
  STARTUP: {
    name: 'Startup',
    description: 'Early-stage company with <50 employees, high growth, high uncertainty',
    typicalSize: '5-50 employees',
    pace: 'VERY_FAST',
    structure: 'FLAT',
    stability: 'VERY_LOW',
    growthOpportunity: 'MASSIVE',
    riskLevel: 'VERY_HIGH',
    impactVisibility: 'VERY_HIGH',
    resourceAvailability: 'SCARCE',
    processMaturity: 'NONE',
  },
  GROWTH: {
    name: 'Growth Stage',
    description: 'Rapidly scaling company, 50-500 employees, finding product-market fit',
    typicalSize: '50-500 employees',
    pace: 'FAST',
    structure: 'MINIMAL',
    stability: 'LOW',
    growthOpportunity: 'HIGH',
    riskLevel: 'HIGH',
    impactVisibility: 'HIGH',
    resourceAvailability: 'LIMITED',
    processMaturity: 'EMERGING',
  },
  MID_SIZED: {
    name: 'Mid-Sized Company',
    description: 'Established company, 500-5000 employees, stable operations',
    typicalSize: '500-5,000 employees',
    pace: 'MODERATE',
    structure: 'MODERATE',
    stability: 'MODERATE',
    growthOpportunity: 'MODERATE',
    riskLevel: 'MODERATE',
    impactVisibility: 'MODERATE',
    resourceAvailability: 'ADEQUATE',
    processMaturity: 'DEVELOPING',
  },
  ENTERPRISE: {
    name: 'Large Enterprise',
    description: 'Large corporation, 5000+ employees, established processes',
    typicalSize: '5,000+ employees',
    pace: 'SLOW',
    structure: 'HIERARCHICAL',
    stability: 'HIGH',
    growthOpportunity: 'LIMITED',
    riskLevel: 'LOW',
    impactVisibility: 'LOW',
    resourceAvailability: 'ABUNDANT',
    processMaturity: 'MATURE',
  },
  GOVERNMENT: {
    name: 'Government',
    description: 'Public sector organization, high stability, bureaucratic',
    typicalSize: 'Varies widely',
    pace: 'VERY_SLOW',
    structure: 'BUREAUCRATIC',
    stability: 'VERY_HIGH',
    growthOpportunity: 'LIMITED',
    riskLevel: 'VERY_LOW',
    impactVisibility: 'LOW',
    resourceAvailability: 'ADEQUATE',
    processMaturity: 'RIGID',
  },
  FAMILY_BUSINESS: {
    name: 'Family Business',
    description: 'Family-owned company, unique culture, long-term focus',
    typicalSize: 'Varies widely',
    pace: 'MODERATE',
    structure: 'MODERATE',
    stability: 'HIGH',
    growthOpportunity: 'MODERATE',
    riskLevel: 'LOW',
    impactVisibility: 'MODERATE',
    resourceAvailability: 'LIMITED',
    processMaturity: 'DEVELOPING',
  },
};

/** Career-specific stage differences */
const CAREER_STAGE_DIFFERENCES: Record<string, Record<CompanyStage, string[]>> = {
  'product-manager': {
    STARTUP: [
      'You are the product team',
      'Hands-on execution required',
      'Direct customer contact',
      'No formal process - you create it',
      'Wearing multiple hats (PM, designer, QA)',
    ],
    GROWTH: [
      'Building the product team',
      'Establishing product processes',
      'Still hands-on but scaling',
      'Balancing strategy and execution',
      'High visibility, high pressure',
    ],
    MID_SIZED: [
      'Specialized PM role',
      'Established product processes',
      'Cross-functional coordination',
      'More stakeholder management',
      'Clearer career progression',
    ],
    ENTERPRISE: [
      'Highly specialized role',
      'Heavy stakeholder management',
      'Bureaucratic processes',
      'Political navigation required',
      'Slower decision-making',
    ],
    GOVERNMENT: [
      'Process-heavy environment',
      'Limited product autonomy',
      'Compliance and regulation focus',
      'Slow procurement cycles',
      'Long-term project timelines',
    ],
    FAMILY_BUSINESS: [
      'Close relationship with owners',
      'Long-term relationship focus',
      'Personal stake in outcomes',
      'Limited resources but high trust',
      'Wearing multiple hats',
    ],
  },
  'software-engineer': {
    STARTUP: [
      'Full-stack by necessity',
      'Rapid prototyping',
      'Technical debt accumulation',
      'Direct impact on product',
      'Limited mentorship',
    ],
    GROWTH: [
      'Specializing in domain',
      'Scaling systems',
      'More code review processes',
      'Growing team collaboration',
      'Still fast-paced but organized',
    ],
    MID_SIZED: [
      'Clear specialization',
      'Established engineering practices',
      'Regular sprint cycles',
      'Dedicated DevOps support',
      'Structured onboarding',
    ],
    ENTERPRISE: [
      'Deep specialization',
      'Heavy process and approvals',
      'Legacy system maintenance',
      'Multiple layers of review',
      'Slower release cycles',
    ],
    GOVERNMENT: [
      'Security and compliance focus',
      'Legacy technology stacks',
      'Extensive documentation',
      'Slow change processes',
      'Stable but limited innovation',
    ],
    FAMILY_BUSINESS: [
      'Wearing multiple technical hats',
      'Direct business impact',
      'Limited modern tooling',
      'Close business relationship',
      'Long-term code ownership',
    ],
  },
  'default': {
    STARTUP: [
      'Wearing multiple hats',
      'High autonomy and impact',
      'Limited resources',
      'Fast-paced and uncertain',
      'Direct access to leadership',
    ],
    GROWTH: [
      'Scaling processes',
      'Growing team',
      'Balancing speed and structure',
      'Career growth opportunities',
      'Increasing specialization',
    ],
    MID_SIZED: [
      'Established role',
      'Clear processes',
      'Moderate resources',
      'Stable environment',
      'Defined career path',
    ],
    ENTERPRISE: [
      'Highly specialized',
      'Bureaucratic processes',
      'Abundant resources',
      'Political navigation',
      'Slow decision-making',
    ],
    GOVERNMENT: [
      'Process-driven',
      'High job security',
      'Limited innovation',
      'Bureaucratic hurdles',
      'Work-life balance focus',
    ],
    FAMILY_BUSINESS: [
      'Personal relationships matter',
      'Long-term focus',
      'Wearing multiple hats',
      'Close to decision-makers',
      'Unique culture',
    ],
  },
};

/**
 * Company Stage Engine - Models career differences across company stages.
 */
export class CompanyStageEngine {
  /**
   * Get characteristics for a company stage.
   */
  getStageCharacteristics(stage: CompanyStage): StageCharacteristics {
    return STAGE_DEFINITIONS[stage];
  }

  /**
   * Generate all stage variants for a career.
   */
  generateStageVariants(
    input: CompanyStageInput,
    dailyLifeGenerator: (input: DailyLifeInput) => DailyLifeProfile,
    workEnvironmentGenerator: (input: WorkEnvironmentInput) => WorkEnvironmentProfile
  ): CompanyStageVariant[] {
    const stages: CompanyStage[] = ['STARTUP', 'GROWTH', 'MID_SIZED', 'ENTERPRISE', 'GOVERNMENT', 'FAMILY_BUSINESS'];

    return stages.map((stage) =>
      this.generateStageVariant(stage, input, dailyLifeGenerator, workEnvironmentGenerator)
    );
  }

  /**
   * Generate a specific stage variant.
   */
  generateStageVariant(
    stage: CompanyStage,
    input: CompanyStageInput,
    dailyLifeGenerator: (input: DailyLifeInput) => DailyLifeProfile,
    workEnvironmentGenerator: (input: WorkEnvironmentInput) => WorkEnvironmentProfile
  ): CompanyStageVariant {
    const characteristics = STAGE_DEFINITIONS[stage];
    const differences = this.getStageDifferences(input.careerId, stage);

    // Generate daily life for this stage
    const dailyLifeInput: DailyLifeInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: stage,
    };

    // Generate work environment for this stage
    const workEnvInput: WorkEnvironmentInput = {
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      companyStage: stage,
    };

    return {
      stage,
      differences,
      workEnvironment: workEnvironmentGenerator(workEnvInput),
      dailyLife: dailyLifeGenerator(dailyLifeInput),
      satisfaction: this.generateStageSatisfaction(stage, input),
    };
  }

  /**
   * Get stage differences for a career.
   */
  private getStageDifferences(careerId: CareerId, stage: CompanyStage): StageDifference[] {
    const careerKey = this.getCareerKey(careerId);
    const differences =
      CAREER_STAGE_DIFFERENCES[careerKey]?.[stage] ||
      CAREER_STAGE_DIFFERENCES.default[stage];

    return differences.map((difference, index) => ({
      aspect: `Stage Characteristic ${index + 1}`,
      difference,
      magnitude: this.calculateMagnitude(stage, difference),
    }));
  }

  /**
   * Get career key for looking up differences.
   */
  private getCareerKey(careerId: CareerId): string {
    if (careerId.includes('product-manager')) return 'product-manager';
    if (careerId.includes('software-engineer') || careerId.includes('developer'))
      return 'software-engineer';
    return 'default';
  }

  /**
   * Calculate magnitude of difference.
   */
  private calculateMagnitude(stage: CompanyStage, difference: string): number {
    // Higher magnitude for more extreme stages
    const stageMultiplier: Record<CompanyStage, number> = {
      STARTUP: 90,
      GROWTH: 70,
      MID_SIZED: 50,
      ENTERPRISE: 75,
      GOVERNMENT: 80,
      FAMILY_BUSINESS: 60,
    };

    // Adjust based on difference content
    let magnitude = stageMultiplier[stage];

    if (difference.includes('multiple hats') || difference.includes('bureaucratic')) {
      magnitude += 10;
    }
    if (difference.includes('specialized') || difference.includes('process')) {
      magnitude += 5;
    }

    return Math.min(100, magnitude);
  }

  /**
   * Generate satisfaction profile for a stage.
   */
  private generateStageSatisfaction(
    stage: CompanyStage,
    input: CompanyStageInput
  ): SatisfactionProfile {
    const stageChars = STAGE_DEFINITIONS[stage];

    // Base satisfaction varies by stage
    const baseSatisfaction: Record<CompanyStage, number> = {
      STARTUP: 65, // High highs, low lows
      GROWTH: 70, // Exciting but chaotic
      MID_SIZED: 75, // Balanced
      ENTERPRISE: 70, // Stable but bureaucratic
      GOVERNMENT: 65, // Secure but slow
      FAMILY_BUSINESS: 72, // Personal but complex
    };

    return {
      overallSatisfaction: baseSatisfaction[stage],
      drivers: this.generateStageDrivers(stage),
      frustrations: this.generateStageFrustrations(stage),
      rewards: this.generateStageRewards(stage),
      exitPatterns: this.generateStageExitPatterns(stage),
      fulfillmentTrajectory: {
        earlyCareer: stage === 'STARTUP' ? 80 : stage === 'GOVERNMENT' ? 60 : 70,
        midCareer: baseSatisfaction[stage],
        lateCareer: stage === 'ENTERPRISE' || stage === 'GOVERNMENT' ? 75 : 65,
        description: this.generateTrajectoryDescription(stage),
        inflectionPoints: this.generateInflectionPoints(stage),
      },
    };
  }

  /**
   * Generate satisfaction drivers for a stage.
   */
  private generateStageDrivers(stage: CompanyStage) {
    const driversByStage: Record<CompanyStage, Array<{ name: string; description: string; importance: number; satisfaction: number; isDifferentiator: boolean }>> = {
      STARTUP: [
        { name: 'Impact', description: 'Direct impact on company success', importance: 95, satisfaction: 90, isDifferentiator: true },
        { name: 'Learning', description: 'Rapid skill development', importance: 90, satisfaction: 85, isDifferentiator: true },
        { name: 'Autonomy', description: 'High decision-making freedom', importance: 85, satisfaction: 80, isDifferentiator: false },
      ],
      GROWTH: [
        { name: 'Growth', description: 'Company and personal growth', importance: 90, satisfaction: 80, isDifferentiator: true },
        { name: 'Opportunity', description: 'Career advancement opportunities', importance: 85, satisfaction: 75, isDifferentiator: true },
        { name: 'Innovation', description: 'Building new things', importance: 80, satisfaction: 75, isDifferentiator: false },
      ],
      MID_SIZED: [
        { name: 'Balance', description: 'Work-life balance', importance: 80, satisfaction: 75, isDifferentiator: false },
        { name: 'Stability', description: 'Job security', importance: 75, satisfaction: 80, isDifferentiator: false },
        { name: 'Growth', description: 'Career development', importance: 70, satisfaction: 70, isDifferentiator: false },
      ],
      ENTERPRISE: [
        { name: 'Resources', description: 'Access to tools and budget', importance: 75, satisfaction: 80, isDifferentiator: true },
        { name: 'Benefits', description: 'Comprehensive benefits', importance: 70, satisfaction: 85, isDifferentiator: false },
        { name: 'Prestige', description: 'Brand recognition', importance: 65, satisfaction: 75, isDifferentiator: false },
      ],
      GOVERNMENT: [
        { name: 'Security', description: 'Job security', importance: 95, satisfaction: 90, isDifferentiator: true },
        { name: 'Benefits', description: 'Pension and benefits', importance: 85, satisfaction: 85, isDifferentiator: true },
        { name: 'Impact', description: 'Public service impact', importance: 70, satisfaction: 65, isDifferentiator: false },
      ],
      FAMILY_BUSINESS: [
        { name: 'Relationships', description: 'Close team relationships', importance: 85, satisfaction: 80, isDifferentiator: true },
        { name: 'Impact', description: 'Visible impact', importance: 80, satisfaction: 75, isDifferentiator: false },
        { name: 'Longevity', description: 'Long-term focus', importance: 75, satisfaction: 70, isDifferentiator: false },
      ],
    };

    return driversByStage[stage];
  }

  /**
   * Generate frustrations for a stage.
   */
  private generateStageFrustrations(stage: CompanyStage) {
    const frustrationsByStage: Record<CompanyStage, Array<{ name: string; description: string; frequency: number; impact: number; isDealbreaker: boolean; mitigationStrategies: string[] }>> = {
      STARTUP: [
        { name: 'Uncertainty', description: 'Constant uncertainty about future', frequency: 90, impact: 80, isDealbreaker: true, mitigationStrategies: ['Build emergency fund', 'Develop transferable skills'] },
        { name: 'Chaos', description: 'Lack of clear processes', frequency: 85, impact: 70, isDealbreaker: false, mitigationStrategies: ['Create personal systems', 'Document processes'] },
        { name: 'Resources', description: 'Limited resources and tools', frequency: 80, impact: 60, isDealbreaker: false, mitigationStrategies: ['Be resourceful', 'Prioritize ruthlessly'] },
      ],
      GROWTH: [
        { name: 'Change', description: 'Constant organizational change', frequency: 85, impact: 70, isDealbreaker: false, mitigationStrategies: ['Stay adaptable', 'Focus on core skills'] },
        { name: 'Scaling Pain', description: 'Growing pains and chaos', frequency: 80, impact: 65, isDealbreaker: false, mitigationStrategies: ['Embrace the journey', 'Help build processes'] },
        { name: 'Pressure', description: 'High growth expectations', frequency: 75, impact: 70, isDealbreaker: false, mitigationStrategies: ['Set boundaries', 'Communicate capacity'] },
      ],
      MID_SIZED: [
        { name: 'Bureaucracy', description: 'Emerging bureaucracy', frequency: 60, impact: 50, isDealbreaker: false, mitigationStrategies: ['Navigate wisely', 'Find efficient paths'] },
        { name: 'Politics', description: 'Internal politics', frequency: 65, impact: 55, isDealbreaker: false, mitigationStrategies: ['Build relationships', 'Stay neutral'] },
      ],
      ENTERPRISE: [
        { name: 'Bureaucracy', description: 'Heavy processes and approvals', frequency: 85, impact: 75, isDealbreaker: true, mitigationStrategies: ['Learn the system', 'Build relationships'] },
        { name: 'Slow Pace', description: 'Slow decision-making', frequency: 80, impact: 70, isDealbreaker: false, mitigationStrategies: ['Find quick wins', 'Work on side projects'] },
        { name: 'Politics', description: 'Corporate politics', frequency: 75, impact: 65, isDealbreaker: false, mitigationStrategies: ['Navigate carefully', 'Build alliances'] },
      ],
      GOVERNMENT: [
        { name: 'Bureaucracy', description: 'Extensive red tape', frequency: 90, impact: 80, isDealbreaker: true, mitigationStrategies: ['Learn the system', 'Find workarounds'] },
        { name: 'Slow Pace', description: 'Very slow processes', frequency: 85, impact: 75, isDealbreaker: false, mitigationStrategies: ['Focus on outcomes', 'Work on multiple projects'] },
        { name: 'Innovation', description: 'Limited innovation opportunities', frequency: 70, impact: 60, isDealbreaker: false, mitigationStrategies: ['Find innovation pockets', 'Suggest improvements'] },
      ],
      FAMILY_BUSINESS: [
        { name: 'Nepotism', description: 'Family dynamics affecting decisions', frequency: 70, impact: 65, isDealbreaker: false, mitigationStrategies: ['Build trust', 'Understand dynamics'] },
        { name: 'Resources', description: 'Limited resources', frequency: 65, impact: 55, isDealbreaker: false, mitigationStrategies: ['Be creative', 'Prioritize'] },
        { name: 'Growth', description: 'Limited growth opportunities', frequency: 60, impact: 50, isDealbreaker: false, mitigationStrategies: ['Create your role', 'Expand responsibilities'] },
      ],
    };

    return frustrationsByStage[stage];
  }

  /**
   * Generate rewards for a stage.
   */
  private generateStageRewards(stage: CompanyStage) {
    const rewardsByStage: Record<CompanyStage, Array<{ name: string; description: string; frequency: number; impact: number; isRetentionFactor: boolean }>> = {
      STARTUP: [
        { name: 'Equity', description: 'Potential equity upside', frequency: 70, impact: 90, isRetentionFactor: true },
        { name: 'Impact', description: 'Direct impact on company', frequency: 95, impact: 85, isRetentionFactor: true },
        { name: 'Learning', description: 'Rapid skill development', frequency: 90, impact: 80, isRetentionFactor: true },
      ],
      GROWTH: [
        { name: 'Growth', description: 'Company growth opportunities', frequency: 85, impact: 80, isRetentionFactor: true },
        { name: 'Equity', description: 'Equity potential', frequency: 60, impact: 75, isRetentionFactor: true },
        { name: 'Innovation', description: 'Building new things', frequency: 80, impact: 70, isRetentionFactor: false },
      ],
      MID_SIZED: [
        { name: 'Balance', description: 'Work-life balance', frequency: 75, impact: 75, isRetentionFactor: true },
        { name: 'Stability', description: 'Job security', frequency: 80, impact: 70, isRetentionFactor: true },
        { name: 'Growth', description: 'Career development', frequency: 70, impact: 65, isRetentionFactor: false },
      ],
      ENTERPRISE: [
        { name: 'Benefits', description: 'Comprehensive benefits', frequency: 90, impact: 80, isRetentionFactor: true },
        { name: 'Resources', description: 'Abundant resources', frequency: 85, impact: 75, isRetentionFactor: false },
        { name: 'Prestige', description: 'Brand recognition', frequency: 70, impact: 60, isRetentionFactor: false },
      ],
      GOVERNMENT: [
        { name: 'Security', description: 'Job security', frequency: 95, impact: 90, isRetentionFactor: true },
        { name: 'Benefits', description: 'Pension and benefits', frequency: 90, impact: 85, isRetentionFactor: true },
        { name: 'Balance', description: 'Work-life balance', frequency: 80, impact: 70, isRetentionFactor: true },
      ],
      FAMILY_BUSINESS: [
        { name: 'Relationships', description: 'Close relationships', frequency: 85, impact: 75, isRetentionFactor: true },
        { name: 'Impact', description: 'Visible impact', frequency: 80, impact: 70, isRetentionFactor: false },
        { name: 'Longevity', description: 'Long-term focus', frequency: 75, impact: 65, isRetentionFactor: false },
      ],
    };

    return rewardsByStage[stage];
  }

  /**
   * Generate exit patterns for a stage.
   */
  private generateStageExitPatterns(stage: CompanyStage) {
    const patternsByStage: Record<CompanyStage, Array<{ reason: string; description: string; frequency: number; typicalStage: string; destinations: string[] }>> = {
      STARTUP: [
        { reason: 'Burnout', description: 'Exhaustion from high intensity', frequency: 40, typicalStage: '2-3 years', destinations: ['Larger company', 'Different startup', 'Sabbatical'] },
        { reason: 'Failure', description: 'Company failure or layoffs', frequency: 35, typicalStage: '1-3 years', destinations: ['Another startup', 'Enterprise', 'Consulting'] },
        { reason: 'Stability', description: 'Seeking more stability', frequency: 25, typicalStage: '2-4 years', destinations: ['Growth stage', 'Enterprise', 'Government'] },
      ],
      GROWTH: [
        { reason: 'Scaling Challenges', description: 'Difficulty with rapid change', frequency: 30, typicalStage: '2-3 years', destinations: ['Startup', 'Mid-sized', 'Enterprise'] },
        { reason: 'Specialization', description: 'Seeking more specialized role', frequency: 25, typicalStage: '3-5 years', destinations: ['Enterprise', 'Different growth company'] },
        { reason: 'Leadership', description: 'Seeking leadership role', frequency: 20, typicalStage: '3-4 years', destinations: ['Startup (as leader)', 'Enterprise'] },
      ],
      MID_SIZED: [
        { reason: 'Growth', description: 'Seeking faster growth', frequency: 30, typicalStage: '3-5 years', destinations: ['Startup', 'Growth stage'] },
        { reason: 'Resources', description: 'Seeking more resources', frequency: 20, typicalStage: '4-6 years', destinations: ['Enterprise'] },
        { reason: 'Entrepreneurship', description: 'Starting own venture', frequency: 15, typicalStage: '5-7 years', destinations: ['Founder', 'Consultant'] },
      ],
      ENTERPRISE: [
        { reason: 'Entrepreneurship', description: 'Starting own company', frequency: 25, typicalStage: '5-10 years', destinations: ['Startup founder', 'Consultant'] },
        { reason: 'Speed', description: 'Seeking faster pace', frequency: 20, typicalStage: '3-7 years', destinations: ['Startup', 'Growth stage'] },
        { reason: 'Impact', description: 'Seeking more direct impact', frequency: 20, typicalStage: '4-8 years', destinations: ['Startup', 'Non-profit'] },
      ],
      GOVERNMENT: [
        { reason: 'Pace', description: 'Seeking faster pace', frequency: 25, typicalStage: '5-10 years', destinations: ['Private sector', 'Consulting'] },
        { reason: 'Compensation', description: 'Seeking higher pay', frequency: 20, typicalStage: '3-7 years', destinations: ['Private sector', 'Contracting'] },
        { reason: 'Innovation', description: 'Seeking innovation opportunities', frequency: 15, typicalStage: '4-8 years', destinations: ['Tech companies', 'Startups'] },
      ],
      FAMILY_BUSINESS: [
        { reason: 'Growth', description: 'Limited growth opportunities', frequency: 25, typicalStage: '3-7 years', destinations: ['Larger company', 'Startup'] },
        { reason: 'Dynamics', description: 'Family dynamics challenges', frequency: 20, typicalStage: '2-5 years', destinations: ['Different company', 'Start own business'] },
        { reason: 'Compensation', description: 'Seeking higher pay', frequency: 15, typicalStage: '4-8 years', destinations: ['Corporate', 'Consulting'] },
      ],
    };

    return patternsByStage[stage];
  }

  /**
   * Generate trajectory description.
   */
  private generateTrajectoryDescription(stage: CompanyStage): string {
    const descriptions: Record<CompanyStage, string> = {
      STARTUP: 'High initial satisfaction from impact and learning, but burnout risk increases over time',
      GROWTH: 'Strong satisfaction from growth and opportunity, with some stress from scaling challenges',
      MID_SIZED: 'Steady satisfaction with good balance, potential plateau in later years',
      ENTERPRISE: 'Solid satisfaction from stability and resources, potential frustration with bureaucracy over time',
      GOVERNMENT: 'Consistent satisfaction from security, potential boredom in later years',
      FAMILY_BUSINESS: 'Strong satisfaction from relationships, potential frustration with growth limits',
    };

    return descriptions[stage];
  }

  /**
   * Generate inflection points.
   */
  private generateInflectionPoints(stage: CompanyStage) {
    const pointsByStage: Record<CompanyStage, Array<{ name: string; timing: number; description: string; satisfactionImpact: 'INCREASE' | 'DECREASE' | 'PLATEAU' | 'VARIABLE' }>> = {
      STARTUP: [
        { name: 'Series A/B', timing: 1.5, description: 'Funding brings resources but more structure', satisfactionImpact: 'VARIABLE' },
        { name: 'Burnout Risk', timing: 2.5, description: 'Cumulative exhaustion from intensity', satisfactionImpact: 'DECREASE' },
        { name: 'Exit or Scale', timing: 4, description: 'Company success or failure becomes clear', satisfactionImpact: 'VARIABLE' },
      ],
      GROWTH: [
        { name: 'Rapid Hiring', timing: 1.5, description: 'Team expands rapidly', satisfactionImpact: 'VARIABLE' },
        { name: 'Process Implementation', timing: 2.5, description: 'Formal processes introduced', satisfactionImpact: 'DECREASE' },
        { name: 'Specialization', timing: 3.5, description: 'Roles become more specialized', satisfactionImpact: 'PLATEAU' },
      ],
      MID_SIZED: [
        { name: 'Promotion Window', timing: 3, description: 'Key promotion opportunity', satisfactionImpact: 'INCREASE' },
        { name: 'Bureaucracy Emergence', timing: 4, description: 'Processes become more rigid', satisfactionImpact: 'DECREASE' },
        { name: 'Career Plateau', timing: 6, description: 'Limited upward mobility', satisfactionImpact: 'PLATEAU' },
      ],
      ENTERPRISE: [
        { name: 'First Promotion', timing: 3, description: 'Initial career advancement', satisfactionImpact: 'INCREASE' },
        { name: 'Bureaucracy Frustration', timing: 5, description: 'Process fatigue sets in', satisfactionImpact: 'DECREASE' },
        { name: 'Senior Role', timing: 8, description: 'Reach senior level with more autonomy', satisfactionImpact: 'INCREASE' },
      ],
      GOVERNMENT: [
        { name: 'Tenure', timing: 3, description: 'Job security established', satisfactionImpact: 'INCREASE' },
        { name: 'Pace Frustration', timing: 5, description: 'Slow pace becomes noticeable', satisfactionImpact: 'DECREASE' },
        { name: 'Pension Vesting', timing: 10, description: 'Retirement benefits lock in', satisfactionImpact: 'INCREASE' },
      ],
      FAMILY_BUSINESS: [
        { name: 'Trust Building', timing: 2, description: 'Established as trusted member', satisfactionImpact: 'INCREASE' },
        { name: 'Growth Ceiling', timing: 4, description: 'Limited advancement opportunities', satisfactionImpact: 'DECREASE' },
        { name: 'Leadership Role', timing: 7, description: 'Potential for family leadership', satisfactionImpact: 'INCREASE' },
      ],
    };

    return pointsByStage[stage];
  }

  /**
   * Compare careers across stages.
   */
  compareStageVariants(
    variantA: CompanyStageVariant,
    variantB: CompanyStageVariant
  ): {
    similarity: number;
    keyDifferences: string[];
    recommendation: string;
  } {
    const differences: string[] = [];
    const charA = STAGE_DEFINITIONS[variantA.stage];
    const charB = STAGE_DEFINITIONS[variantB.stage];

    // Compare pace
    const paceOrder = ['VERY_SLOW', 'SLOW', 'MODERATE', 'FAST', 'VERY_FAST'];
    const paceDiff = Math.abs(
      paceOrder.indexOf(charA.pace) - paceOrder.indexOf(charB.pace)
    );
    if (paceDiff > 1) {
      differences.push(`Work pace: ${charA.pace} vs ${charB.pace}`);
    }

    // Compare structure
    const structureOrder = ['FLAT', 'MINIMAL', 'MODERATE', 'HIERARCHICAL', 'BUREAUCRATIC'];
    const structureDiff = Math.abs(
      structureOrder.indexOf(charA.structure) - structureOrder.indexOf(charB.structure)
    );
    if (structureDiff > 1) {
      differences.push(`Structure: ${charA.structure} vs ${charB.structure}`);
    }

    // Compare stability
    const stabilityOrder = ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];
    const stabilityDiff = Math.abs(
      stabilityOrder.indexOf(charA.stability) - stabilityOrder.indexOf(charB.stability)
    );
    if (stabilityDiff > 1) {
      differences.push(`Stability: ${charA.stability} vs ${charB.stability}`);
    }

    // Calculate similarity
    const totalDiff = paceDiff + structureDiff + stabilityDiff;
    const similarity = Math.max(0, 100 - totalDiff * 15);

    // Generate recommendation
    let recommendation = '';
    if (charA.stability === 'VERY_LOW' && charB.stability !== 'VERY_LOW') {
      recommendation = `Choose ${variantB.stage} for more stability and lower risk`;
    } else if (charB.stability === 'VERY_LOW' && charA.stability !== 'VERY_LOW') {
      recommendation = `Choose ${variantA.stage} for more stability and lower risk`;
    } else if (charA.growthOpportunity === 'MASSIVE' && charB.growthOpportunity !== 'MASSIVE') {
      recommendation = `Choose ${variantA.stage} for maximum growth potential`;
    } else if (charB.growthOpportunity === 'MASSIVE' && charA.growthOpportunity !== 'MASSIVE') {
      recommendation = `Choose ${variantB.stage} for maximum growth potential`;
    } else {
      recommendation = 'Both stages offer viable career paths - choose based on risk tolerance';
    }

    return { similarity, keyDifferences: differences, recommendation };
  }
}

/**
 * Factory function for CompanyStageEngine.
 */
export function createCompanyStageEngine(): CompanyStageEngine {
  return new CompanyStageEngine();
}
