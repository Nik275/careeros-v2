/**
 * India Intelligence - CA Engine
 * 
 * Models the professional courses ecosystem (CA, CS, CMA) including:
 * - Course structure and examination levels
 * - Articleship and training requirements
 * - Career pathways (Big 4, practice, corporate)
 * - Financial analysis and ROI
 * 
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  CAAnalysis,
  CAPathway,
  ArticleshipAnalysis,
  CACareerOption,
  CAFinancialAnalysis,
  CARecommendation,
  ProfessionalLevel,
  EconomicStratum,
} from '../types';

/**
 * CA Engine Configuration
 */
export interface CAEngineConfig {
  /** Maximum attempts per level before suggesting alternatives */
  maxAttemptsPerLevel: number;
  /** Minimum clear rate to continue recommendation */
  minClearRate: number;
  /** Consider Big 4 articleship as optimal */
  preferBig4Articleship: boolean;
}

/**
 * Default CA Engine configuration
 */
export const DEFAULT_CA_CONFIG: CAEngineConfig = {
  maxAttemptsPerLevel: 10,
  minClearRate: 0.15,
  preferBig4Articleship: true,
};

/**
 * CA Engine
 * 
 * Analyzes CA/CS/CMA pathway viability
 */
export class CAEngine {
  private config: CAEngineConfig;
  
  constructor(config: Partial<CAEngineConfig> = {}) {
    this.config = { ...DEFAULT_CA_CONFIG, ...config };
  }
  
  /**
   * Analyze CA pathway for a student
   */
  analyze(input: IndiaIntelligenceInput, course: 'CA' | 'CS' | 'CMA' = 'CA'): CAAnalysis {
    // Determine current progress
    const currentProgress = this.determineCurrentProgress(input, course);
    
    // Build pathway
    const pathway = this.buildPathway(input, course, currentProgress);
    
    // Analyze articleship
    const articleship = this.analyzeArticleship(input, currentProgress);
    
    // Generate career options
    const careerOptions = this.generateCareerOptions(input, course);
    
    // Calculate timeline
    const timeline = this.calculateTimeline(currentProgress);
    
    // Financial analysis
    const financialAnalysis = this.analyzeFinancials(pathway, careerOptions, input);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      pathway,
      currentProgress,
      articleship,
      financialAnalysis,
      input
    );
    
    return {
      pathway,
      currentProgress,
      articleship,
      careerOptions,
      timelineToQualification: timeline,
      financialAnalysis,
      recommendations,
    };
  }
  
  /**
   * Determine current progress in CA course
   */
  private determineCurrentProgress(
    input: IndiaIntelligenceInput,
    course: 'CA' | 'CS' | 'CMA'
  ): CAAnalysis['currentProgress'] {
    // This would come from exam history in real implementation
    // For now, estimate based on education level
    
    const level = input.profile.currentEducationLevel;
    
    if (level === 'SCHOOL_10') {
      return {
        level: ProfessionalLevel.FOUNDATION,
        attemptsAtCurrentLevel: 0,
        clearRate: 0,
      };
    }
    
    if (level === 'SCHOOL_12') {
      return {
        level: ProfessionalLevel.FOUNDATION,
        attemptsAtCurrentLevel: 0,
        clearRate: 0,
      };
    }
    
    if (level === 'UNDERGRAD') {
      // Assume some progress
      return {
        level: ProfessionalLevel.INTERMEDIATE,
        attemptsAtCurrentLevel: 1,
        clearRate: 0.3,
      };
    }
    
    return {
      level: ProfessionalLevel.ARTICLESHIP,
      attemptsAtCurrentLevel: 0,
      clearRate: 0,
    };
  }
  
  /**
   * Build CA pathway
   */
  private buildPathway(
    input: IndiaIntelligenceInput,
    course: 'CA' | 'CS' | 'CMA',
    currentProgress: CAAnalysis['currentProgress']
  ): CAPathway {
    const currentYear = new Date().getFullYear();
    
    return {
      course,
      stages: {
        foundation: {
          required: currentProgress.level === ProfessionalLevel.FOUNDATION,
          cleared: currentProgress.level > ProfessionalLevel.FOUNDATION,
          attempts: currentProgress.level === ProfessionalLevel.FOUNDATION ? currentProgress.attemptsAtCurrentLevel : 0,
        },
        intermediate: {
          cleared: currentProgress.level > ProfessionalLevel.INTERMEDIATE,
          attempts: currentProgress.level === ProfessionalLevel.INTERMEDIATE ? currentProgress.attemptsAtCurrentLevel : 0,
          groupsCleared: currentProgress.level > ProfessionalLevel.INTERMEDIATE ? 2 : 0,
        },
        final: {
          cleared: currentProgress.level > ProfessionalLevel.FINAL,
          attempts: currentProgress.level === ProfessionalLevel.FINAL ? currentProgress.attemptsAtCurrentLevel : 0,
          groupsCleared: currentProgress.level > ProfessionalLevel.FINAL ? 2 : 0,
        },
        articleship: {
          completed: currentProgress.level > ProfessionalLevel.ARTICLESHIP,
          monthsCompleted: 0,
          monthsRequired: course === 'CA' ? 36 : 15,
        },
      },
      expectedQualification: this.calculateQualificationYear(currentProgress),
    };
  }
  
  /**
   * Calculate expected qualification year
   */
  private calculateQualificationYear(progress: CAAnalysis['currentProgress']): number {
    const currentYear = new Date().getFullYear();
    const yearsRemaining = 
      (progress.level === ProfessionalLevel.FOUNDATION ? 1 : 0) +
      (progress.level <= ProfessionalLevel.INTERMEDIATE ? 1 : 0) +
      (progress.level <= ProfessionalLevel.FINAL ? 1 : 0) +
      (progress.level <= ProfessionalLevel.ARTICLESHIP ? 1 : 0);
    
    return currentYear + yearsRemaining + 1;
  }
  
  /**
   * Analyze articleship situation
   */
  private analyzeArticleship(
    input: IndiaIntelligenceInput,
    progress: CAAnalysis['currentProgress']
  ): ArticleshipAnalysis {
    // If not at articleship stage yet
    if (progress.level < ProfessionalLevel.INTERMEDIATE) {
      return {
        type: 'NOT_STARTED',
        exposure: { audit: 'LOW', taxation: 'LOW', consulting: 'LOW' },
        workLoad: 'MODERATE',
        learningQuality: 'AVERAGE',
        networkingValue: 'LOW',
        stipend: 0,
      };
    }
    
    // Determine likely articleship type based on profile
    const canAccessBig4 = input.profile.familyIncome >= EconomicStratum.MIDDLE_CLASS &&
                          input.profile.academicPerformance.class10Percentage >= 85;
    
    if (canAccessBig4 && this.config.preferBig4Articleship) {
      return {
        type: 'BIG_4',
        firmName: 'Big 4 Firm (Deloitte/PwC/EY/KPMG)',
        exposure: { audit: 'HIGH', taxation: 'HIGH', consulting: 'MODERATE' },
        workLoad: 'EXTREME',
        learningQuality: 'EXCELLENT',
        networkingValue: 'HIGH',
        stipend: 15000,
      };
    }
    
    if (input.profile.familyIncome >= EconomicStratum.LOWER_MIDDLE) {
      return {
        type: 'MID_TIER',
        exposure: { audit: 'HIGH', taxation: 'MODERATE', consulting: 'LOW' },
        workLoad: 'HIGH',
        learningQuality: 'GOOD',
        networkingValue: 'MODERATE',
        stipend: 10000,
      };
    }
    
    return {
      type: 'SMALL_FIRM',
      exposure: { audit: 'MODERATE', taxation: 'HIGH', consulting: 'LOW' },
      workLoad: 'HIGH',
      learningQuality: 'AVERAGE',
      networkingValue: 'LOW',
      stipend: 6000,
    };
  }
  
  /**
   * Generate career options after qualification
   */
  private generateCareerOptions(
    input: IndiaIntelligenceInput,
    course: 'CA' | 'CS' | 'CMA'
  ): CACareerOption[] {
    const options: CACareerOption[] = [];
    
    // Own Practice
    options.push({
      path: 'PRACTICE',
      entrySalary: 500000,
      growthTrajectory: 'EXPONENTIAL',
      workLifeBalance: 'DEMANDING',
      longTermIncome: 5000000,
      suitableFor: ['Entrepreneurial mindset', 'Client servicing skills', 'Risk appetite', course === 'CA' ? 'Excellent for CAs' : 'Good option'],
    });
    
    // Big 4
    options.push({
      path: 'BIG_4',
      entrySalary: 900000,
      growthTrajectory: 'STEEP',
      workLifeBalance: 'DEMANDING',
      longTermIncome: 4000000,
      suitableFor: ['Brand conscious', 'Global exposure interest', 'Initial high salary priority', 'Planning abroad MBA'],
    });
    
    // Corporate MNC
    options.push({
      path: 'CORPORATE_MNC',
      entrySalary: 1200000,
      growthTrajectory: 'STEEP',
      workLifeBalance: 'BALANCED',
      longTermIncome: 5000000,
      suitableFor: ['Work-life balance', 'High initial salary', 'Structured career', 'Less travel'],
    });
    
    // Corporate Indian
    options.push({
      path: 'CORPORATE_INDIAN',
      entrySalary: 800000,
      growthTrajectory: 'MODERATE',
      workLifeBalance: 'BALANCED',
      longTermIncome: 3000000,
      suitableFor: ['Stable growth', 'Indian work culture', 'Long-term loyalty rewards'],
    });
    
    // Startup
    options.push({
      path: 'STARTUP',
      entrySalary: 1000000,
      growthTrajectory: 'EXPONENTIAL',
      workLifeBalance: 'DEMANDING',
      longTermIncome: 4000000,
      suitableFor: ['Dynamic environment', 'Equity potential', 'Fast growth', 'High energy'],
    });
    
    // Consulting
    options.push({
      path: 'CONSULTING',
      entrySalary: 1000000,
      growthTrajectory: 'STEEP',
      workLifeBalance: 'DEMANDING',
      longTermIncome: 4500000,
      suitableFor: ['Problem solving', 'Client interaction', 'Travel willingness', 'Variety'],
    });
    
    // Teaching
    options.push({
      path: 'TEACHING',
      entrySalary: 600000,
      growthTrajectory: 'STEADY',
      workLifeBalance: 'BALANCED',
      longTermIncome: 2000000,
      suitableFor: ['Teaching passion', 'Flexible schedule', 'Academic interest', 'Work-life priority'],
    });
    
    return options;
  }
  
  /**
   * Calculate timeline to qualification in months
   */
  private calculateTimeline(progress: CAAnalysis['currentProgress']): number {
    const monthsRemaining = 
      (progress.level === ProfessionalLevel.FOUNDATION ? 6 : 0) +
      (progress.level <= ProfessionalLevel.INTERMEDIATE ? 12 : 0) +
      (progress.level <= ProfessionalLevel.FINAL ? 12 : 0) +
      (progress.level <= ProfessionalLevel.ARTICLESHIP ? 36 : 0);
    
    return monthsRemaining;
  }
  
  /**
   * Analyze financial aspects
   */
  private analyzeFinancials(
    pathway: CAPathway,
    careers: CACareerOption[],
    input: IndiaIntelligenceInput
  ): CAFinancialAnalysis {
    // Course costs
    const foundationCost = 10000;
    const intermediateCost = 30000;
    const finalCost = 30000;
    const coachingCost = input.profile.familyIncome >= EconomicStratum.MIDDLE_CLASS ? 200000 : 50000;
    
    const totalCourseCost = foundationCost + intermediateCost + finalCost + coachingCost;
    
    // Articleship earnings (approximate)
    const articleshipMonths = 36;
    const avgStipend = 10000;
    const articleshipEarnings = articleshipMonths * avgStipend;
    
    const netCost = totalCourseCost - articleshipEarnings;
    
    // Best career path income
    const bestCareer = careers.sort((a, b) => b.longTermIncome - a.longTermIncome)[0];
    const avgStarting = careers.reduce((sum, c) => sum + c.entrySalary, 0) / careers.length;
    
    const roi = bestCareer.longTermIncome / Math.max(netCost, 1);
    
    // Break even age
    const currentAge = this.estimateAge(input);
    const yearsToQualify = this.calculateTimeline({
      level: pathway.stages.foundation.cleared ? 
             pathway.stages.intermediate.cleared ? 
             pathway.stages.final.cleared ? ProfessionalLevel.QUALIFIED : ProfessionalLevel.FINAL
             : ProfessionalLevel.INTERMEDIATE
             : ProfessionalLevel.FOUNDATION,
      attemptsAtCurrentLevel: 0,
      clearRate: 0,
    }) / 12;
    
    const breakEvenAge = Math.round(currentAge + yearsToQualify + (netCost / avgStarting));
    
    return {
      totalCourseCost,
      articleshipEarnings,
      netCost,
      roi,
      breakEvenAge,
      comparisonWithMBA: 'Lower cost than MBA (even IIMs cost 20L+), no opportunity cost during articleship, better for finance/accounting careers',
    };
  }
  
  /**
   * Estimate age from education level
   */
  private estimateAge(input: IndiaIntelligenceInput): number {
    const ageMap: Record<string, number> = {
      'SCHOOL_10': 15,
      'SCHOOL_12': 17,
      'UNDERGRAD': 20,
      'POSTGRAD': 24,
      'WORKING': 24,
    };
    return ageMap[input.profile.currentEducationLevel] || 22;
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(
    pathway: CAPathway,
    progress: CAAnalysis['currentProgress'],
    articleship: ArticleshipAnalysis,
    financials: CAFinancialAnalysis,
    input: IndiaIntelligenceInput
  ): CARecommendation {
    const shouldContinue = progress.clearRate >= this.config.minClearRate ||
                          progress.attemptsAtCurrentLevel < this.config.maxAttemptsPerLevel;
    
    // Determine alternative if struggling
    let alternativeIfStruggling = '';
    if (progress.attemptsAtCurrentLevel >= 5 && progress.clearRate < 0.2) {
      alternativeIfStruggling = 'Consider CS or CMA - similar scope, different exam pattern that may suit you better';
    }
    
    // Optimal career path
    let optimalCareerPath = 'CORPORATE_MNC';
    if (input.selfAssessment.riskTolerance === 'HIGH') {
      optimalCareerPath = 'PRACTICE';
    } else if (input.profile.familyIncome >= EconomicStratum.UPPER_MIDDLE) {
      optimalCareerPath = 'BIG_4';
    }
    
    const timeline = `${this.calculateTimeline(progress)} months to qualification (approx ${Math.ceil(this.calculateTimeline(progress) / 12)} years)`;
    
    const strategyForSuccess: string[] = [];
    
    if (progress.level === ProfessionalLevel.FOUNDATION) {
      strategyForSuccess.push('Focus on strong foundation in accounting basics');
      strategyForSuccess.push('Consider coaching if self-study is not working');
    }
    
    if (progress.level === ProfessionalLevel.INTERMEDIATE) {
      strategyForSuccess.push('Group-wise preparation strategy');
      strategyForSuccess.push('Solve RTPs and past papers extensively');
    }
    
    if (progress.level === ProfessionalLevel.ARTICLESHIP || progress.level === ProfessionalLevel.FINAL) {
      strategyForSuccess.push('Balance articleship work with final preparation');
      strategyForSuccess.push('Leave 3-4 months full-time for final exam');
    }
    
    strategyForSuccess.push('Focus on Big 4 articleship if possible - transforms career prospects');
    
    return {
      shouldContinue,
      alternativeIfStruggling,
      optimalCareerPath,
      timelineToCompletion: timeline,
      strategyForSuccess,
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<CAEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for CA Engine
 */
export function createCAEngine(config?: Partial<CAEngineConfig>): CAEngine {
  return new CAEngine(config);
}
