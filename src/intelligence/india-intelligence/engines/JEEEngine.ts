/**
 * India Intelligence - JEE Engine
 * 
 * Models the complete JEE (Joint Entrance Examination) ecosystem including:
 * - JEE Main and Advanced exam pathways
 * - College tiers (IIT, NIT, IIIT, BITS, State, Private)
 * - Branch tradeoffs (CSE vs traditional branches)
 * - Drop year decision analysis
 * - Financial ROI calculations
 * 
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  JEEAnalysis,
  JEEOutcome,
  JEEPathway,
  EngineeringCollegeTier,
  EngineeringBranch,
  PlacementTier,
  EconomicStratum,
  TierVsBranchTradeoff,
  CollegeVsLocationTradeoff,
  FeesVsPlacementTradeoff,
  JEEPathwayAnalysis,
  ExamAttempt,
} from '../types';

/**
 * JEE Engine Configuration
 */
export interface JEEEngineConfig {
  /** Maximum recommended drop years */
  maxDropYears: number;
  /** Minimum rank improvement expected for drop year */
  minRankImprovementForDropYear: number;
  /** Consider financial constraints in recommendations */
  considerFinancialConstraints: boolean;
  /** CSE premium multiplier for career outcomes */
  csePremiumMultiplier: number;
}

/**
 * Default JEE Engine configuration
 */
export const DEFAULT_JEE_CONFIG: JEEEngineConfig = {
  maxDropYears: 2,
  minRankImprovementForDropYear: 20000,
  considerFinancialConstraints: true,
  csePremiumMultiplier: 1.5,
};

const ENGINEERING_COLLEGE_TIER_RANK: Record<EngineeringCollegeTier, number> = {
  [EngineeringCollegeTier.OLD_IIT]: 1,
  [EngineeringCollegeTier.NEW_IIT]: 2,
  [EngineeringCollegeTier.TOP_NIT]: 3,
  [EngineeringCollegeTier.OTHER_NIT]: 4,
  [EngineeringCollegeTier.IIIT_HYDERABAD]: 5,
  [EngineeringCollegeTier.IIIT_BANGALORE]: 6,
  [EngineeringCollegeTier.OTHER_IIIT]: 7,
  [EngineeringCollegeTier.BITS]: 8,
  [EngineeringCollegeTier.DTU_NSIT]: 9,
  [EngineeringCollegeTier.TOP_STATE_GOV]: 10,
  [EngineeringCollegeTier.OTHER_STATE_GOV]: 11,
  [EngineeringCollegeTier.PRIVATE_TIER1]: 12,
  [EngineeringCollegeTier.PRIVATE_TIER2]: 13,
  [EngineeringCollegeTier.PRIVATE_TIER3]: 14,
};

/**
 * JEE Engine
 * 
 * Analyzes JEE-related career pathways and generates recommendations
 */
export class JEEEngine {
  private config: JEEEngineConfig;
  
  constructor(config: Partial<JEEEngineConfig> = {}) {
    this.config = { ...DEFAULT_JEE_CONFIG, ...config };
  }
  
  /**
   * Analyze JEE pathway for a student
   */
  analyze(input: IndiaIntelligenceInput): JEEAnalysis {
    const jeeAttempts = this.extractJEEAttempts(input.profile.examAttempts);
    const currentRank = this.getBestJEERank(jeeAttempts);
    
    // Generate eligible colleges based on rank
    const eligibleColleges = currentRank 
      ? this.generateCollegesForRank(currentRank, input)
      : [];
    
    // Analyze drop year option
    const dropYearAnalysis = this.analyzeDropYearOption(jeeAttempts, currentRank, input);
    
    // Generate state CET options
    const stateCETOptions = this.generateStateCETOptions(input);
    
    // Generate private college options
    const privateCollegeOptions = this.generatePrivateCollegeOptions(input);
    
    // Analyze tradeoffs
    const tierVsBranch = this.analyzeTierVsBranch(eligibleColleges, input);
    const collegeVsLocation = this.analyzeCollegeVsLocation(eligibleColleges, input);
    const feesVsPlacement = this.analyzeFeesVsPlacement(eligibleColleges);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      eligibleColleges,
      dropYearAnalysis,
      input
    );
    
    return {
      currentStatus: {
        jeeMainRank: this.getJEEMainRank(jeeAttempts),
        jeeAdvancedRank: this.getJEEAdvancedRank(jeeAttempts),
        eligibleColleges,
      },
      options: {
        acceptCurrent: eligibleColleges,
        dropYear: dropYearAnalysis,
        stateCET: stateCETOptions,
        privateColleges: privateCollegeOptions,
      },
      tradeoffs: {
        tierVsBranch,
        collegeVsLocation,
        feesVsPlacement,
      },
      recommendations,
    };
  }
  
  /**
   * Extract JEE-related exam attempts
   */
  private extractJEEAttempts(attempts: ExamAttempt[]): ExamAttempt[] {
    return attempts.filter(a => 
      a.examType === 'JEE'
    );
  }
  
  /**
   * Get best JEE rank from attempts
   */
  private getBestJEERank(attempts: ExamAttempt[]): number | undefined {
    const rankedAttempts = attempts
      .filter(a => a.rank && a.rank > 0)
      .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
    
    return rankedAttempts[0]?.rank;
  }
  
  /**
   * Get JEE Main rank
   */
  private getJEEMainRank(attempts: ExamAttempt[]): number | undefined {
    return attempts.find(a => a.examType === 'JEE')?.rank;
  }
  
  /**
   * Get JEE Advanced rank
   */
  private getJEEAdvancedRank(attempts: ExamAttempt[]): number | undefined {
    return attempts.find(a => a.examType === 'JEE')?.rank;
  }
  
  /**
   * Generate colleges based on rank
   */
  private generateCollegesForRank(
    rank: number,
    input: IndiaIntelligenceInput
  ): JEEOutcome[] {
    const colleges: JEEOutcome[] = [];
    const category = 'GENERAL'; // Should come from profile
    
    // IITs (rank 1-15000)
    if (rank <= 15000) {
      colleges.push(...this.generateIITOptions(rank, category));
    }
    
    // NITs (rank 1000-50000)
    if (rank <= 50000) {
      colleges.push(...this.generateNITOptions(rank, category));
    }
    
    // IIITs (rank 5000-75000)
    if (rank <= 75000) {
      colleges.push(...this.generateIIITOptions(rank, category));
    }
    
    // BITS (rank 5000-30000)
    if (rank <= 30000) {
      colleges.push(this.generateBITSOptions());
    }
    
    // Top state colleges (rank 10000-100000)
    if (rank <= 100000) {
      colleges.push(...this.generateStateCollegeOptions(rank, input.profile.homeState));
    }
    
    // Private colleges (any rank)
    colleges.push(...this.generateAffordablePrivateOptions(input));
    
    return colleges.filter(c => this.isCollegeAccessible(c, input));
  }
  
  /**
   * Generate IIT options
   */
  private generateIITOptions(rank: number, category: string): JEEOutcome[] {
    const iits: JEEOutcome[] = [];
    
    const oldIITs = [
      { name: 'IIT Bombay', location: 'Mumbai', nirf: 1, closingRank: 5000 },
      { name: 'IIT Delhi', location: 'Delhi', nirf: 2, closingRank: 6000 },
      { name: 'IIT Madras', location: 'Chennai', nirf: 3, closingRank: 7000 },
      { name: 'IIT Kanpur', location: 'Kanpur', nirf: 4, closingRank: 8000 },
      { name: 'IIT Kharagpur', location: 'Kharagpur', nirf: 5, closingRank: 9000 },
      { name: 'IIT Roorkee', location: 'Roorkee', nirf: 6, closingRank: 10000 },
      { name: 'IIT Guwahati', location: 'Guwahati', nirf: 7, closingRank: 11000 },
    ];
    
    const newIITs = [
      { name: 'IIT Hyderabad', location: 'Hyderabad', nirf: 8, closingRank: 12000 },
      { name: 'IIT BHU', location: 'Varanasi', nirf: 11, closingRank: 13000 },
      { name: 'IIT Indore', location: 'Indore', nirf: 14, closingRank: 14000 },
      { name: 'IIT Ropar', location: 'Ropar', nirf: 22, closingRank: 15000 },
    ];
    
    for (const iit of oldIITs) {
      if (rank <= iit.closingRank) {
        iits.push(this.createJEEResult(iit.name, iit.location, EngineeringCollegeTier.OLD_IIT, iit.nirf));
      }
    }
    
    for (const iit of newIITs) {
      if (rank <= iit.closingRank) {
        iits.push(this.createJEEResult(iit.name, iit.location, EngineeringCollegeTier.NEW_IIT, iit.nirf));
      }
    }
    
    return iits;
  }
  
  /**
   * Generate NIT options
   */
  private generateNITOptions(rank: number, category: string): JEEOutcome[] {
    const nits: JEEOutcome[] = [];
    
    const topNITs = [
      { name: 'NIT Trichy', location: 'Tiruchirappalli', nirf: 9, closingRank: 25000 },
      { name: 'NIT Surathkal', location: 'Surathkal', nirf: 12, closingRank: 28000 },
      { name: 'NIT Warangal', location: 'Warangal', nirf: 21, closingRank: 30000 },
      { name: 'NIT Calicut', location: 'Calicut', nirf: 23, closingRank: 35000 },
    ];
    
    const otherNITs = [
      { name: 'NIT Durgapur', location: 'Durgapur', nirf: 34, closingRank: 45000 },
      { name: 'NIT Kurukshetra', location: 'Kurukshetra', nirf: 38, closingRank: 48000 },
      { name: 'NIT Silchar', location: 'Silchar', nirf: 40, closingRank: 50000 },
    ];
    
    for (const nit of topNITs) {
      if (rank <= nit.closingRank) {
        nits.push(this.createJEEResult(nit.name, nit.location, EngineeringCollegeTier.TOP_NIT, nit.nirf));
      }
    }
    
    for (const nit of otherNITs) {
      if (rank <= nit.closingRank) {
        nits.push(this.createJEEResult(nit.name, nit.location, EngineeringCollegeTier.OTHER_NIT, nit.nirf));
      }
    }
    
    return nits;
  }
  
  /**
   * Generate IIIT options
   */
  private generateIIITOptions(rank: number, category: string): JEEOutcome[] {
    const iiits: JEEOutcome[] = [];
    
    if (rank <= 8000) {
      iiits.push(this.createJEEResult(
        'IIIT Hyderabad',
        'Hyderabad',
        EngineeringCollegeTier.IIIT_HYDERABAD,
        55,
        { averagePackage: 2500000, medianPackage: 2000000, tier: PlacementTier.TIER_1 }
      ));
    }
    
    if (rank <= 15000) {
      iiits.push(this.createJEEResult(
        'IIIT Bangalore',
        'Bangalore',
        EngineeringCollegeTier.IIIT_BANGALORE,
        74,
        { averagePackage: 1800000, medianPackage: 1500000, tier: PlacementTier.TIER_2 }
      ));
    }
    
    const otherIIITs = [
      { name: 'IIIT Delhi', location: 'Delhi', closingRank: 25000 },
      { name: 'IIIT Allahabad', location: 'Allahabad', closingRank: 40000 },
      { name: 'IIIT Gwalior', location: 'Gwalior', closingRank: 50000 },
    ];
    
    for (const iiit of otherIIITs) {
      if (rank <= iiit.closingRank) {
        iiits.push(this.createJEEResult(iiit.name, iiit.location, EngineeringCollegeTier.OTHER_IIIT));
      }
    }
    
    return iiits;
  }
  
  /**
   * Generate BITS options
   */
  private generateBITSOptions(): JEEOutcome {
    return this.createJEEResult(
      'BITS Pilani',
      'Pilani',
      EngineeringCollegeTier.BITS,
      25,
      { averagePackage: 1500000, medianPackage: 1200000, tier: PlacementTier.TIER_2 }
    );
  }
  
  /**
   * Generate state college options
   */
  private generateStateCollegeOptions(rank: number, homeState: string): JEEOutcome[] {
    const colleges: JEEOutcome[] = [];
    
    // Top state government colleges
    const topStateColleges = [
      { name: 'COEP Pune', state: 'Maharashtra', closingRank: 60000 },
      { name: 'VJTI Mumbai', state: 'Maharashtra', closingRank: 65000 },
      { name: 'DTU Delhi', state: 'Delhi', closingRank: 50000 },
      { name: 'NSIT Delhi', state: 'Delhi', closingRank: 55000 },
      { name: 'PEC Chandigarh', state: 'Chandigarh', closingRank: 70000 },
      { name: 'RVCE Bangalore', state: 'Karnataka', closingRank: 80000 },
    ];
    
    for (const college of topStateColleges) {
      if (rank <= college.closingRank) {
        colleges.push(this.createJEEResult(
          college.name,
          college.state,
          EngineeringCollegeTier.TOP_STATE_GOV,
          undefined,
          { averagePackage: 800000, medianPackage: 600000, tier: PlacementTier.TIER_3 }
        ));
      }
    }
    
    return colleges;
  }
  
  /**
   * Generate affordable private college options
   */
  private generateAffordablePrivateOptions(input: IndiaIntelligenceInput): JEEOutcome[] {
    const budget = input.profile.financialConstraints.maxEducationBudget;
    const colleges: JEEOutcome[] = [];
    
    // Tier 1 private (VIT, SRM, Manipal) - 15-25L total
    if (budget >= 1500000) {
      colleges.push(this.createJEEResult(
        'VIT Vellore',
        'Vellore',
        EngineeringCollegeTier.PRIVATE_TIER1,
        12,
        { 
          averagePackage: 700000, 
          medianPackage: 500000, 
          tier: PlacementTier.TIER_3,
          fees: { perYear: 400000, total4Years: 1600000, hostelAdditional: 600000 }
        }
      ));
      
      colleges.push(this.createJEEResult(
        'SRM University',
        'Chennai',
        EngineeringCollegeTier.PRIVATE_TIER1,
        undefined,
        { 
          averagePackage: 600000, 
          medianPackage: 450000, 
          tier: PlacementTier.TIER_3,
          fees: { perYear: 350000, total4Years: 1400000, hostelAdditional: 500000 }
        }
      ));
    }
    
    // Tier 2 private - 8-15L total
    if (budget >= 800000) {
      colleges.push(this.createJEEResult(
        'Thapar University',
        'Patiala',
        EngineeringCollegeTier.PRIVATE_TIER2,
        undefined,
        { 
          averagePackage: 700000, 
          medianPackage: 500000, 
          tier: PlacementTier.TIER_3,
          fees: { perYear: 300000, total4Years: 1200000, hostelAdditional: 400000 }
        }
      ));
    }
    
    return colleges;
  }
  
  /**
   * Create JEE result object
   */
  private createJEEResult(
    name: string,
    location: string,
    tier: EngineeringCollegeTier,
    nirfRank?: number,
    overrides?: Partial<JEEOutcome['placement']> &
      Partial<JEEOutcome['fees']> & {
        fees?: Partial<JEEOutcome['fees']>;
      }
  ): JEEOutcome {
    const defaultFees = this.getDefaultFees(tier);
    const defaultPlacement = this.getDefaultPlacement(tier);
    
    return {
      collegeTier: tier,
      collegeName: name,
      branch: EngineeringBranch.CSE, // Default, should be configurable
      location,
      fees: {
        perYear: overrides?.fees?.perYear || overrides?.perYear || defaultFees.perYear,
        total4Years:
          overrides?.fees?.total4Years || overrides?.total4Years || defaultFees.total4Years,
        hostelAdditional:
          overrides?.fees?.hostelAdditional ||
          overrides?.hostelAdditional ||
          defaultFees.hostelAdditional,
      },
      placement: {
        tier: overrides?.tier || defaultPlacement.tier,
        averagePackage: overrides?.averagePackage || defaultPlacement.averagePackage,
        medianPackage: overrides?.medianPackage || defaultPlacement.medianPackage,
        topRecruiters: this.getTopRecruiters(tier),
        placementPercentage: defaultPlacement.placementPercentage,
      },
      ranking: {
        nirfRank,
        perceivedTier: tier,
      },
      opportunities: this.getOpportunities(tier),
    };
  }
  
  /**
   * Get default fees for college tier
   */
  private getDefaultFees(tier: EngineeringCollegeTier) {
    const fees: Record<EngineeringCollegeTier, { perYear: number; total4Years: number; hostelAdditional: number }> = {
      [EngineeringCollegeTier.OLD_IIT]: { perYear: 250000, total4Years: 1000000, hostelAdditional: 400000 },
      [EngineeringCollegeTier.NEW_IIT]: { perYear: 250000, total4Years: 1000000, hostelAdditional: 350000 },
      [EngineeringCollegeTier.TOP_NIT]: { perYear: 180000, total4Years: 720000, hostelAdditional: 300000 },
      [EngineeringCollegeTier.OTHER_NIT]: { perYear: 160000, total4Years: 640000, hostelAdditional: 280000 },
      [EngineeringCollegeTier.IIIT_HYDERABAD]: { perYear: 300000, total4Years: 1200000, hostelAdditional: 400000 },
      [EngineeringCollegeTier.IIIT_BANGALORE]: { perYear: 280000, total4Years: 1120000, hostelAdditional: 350000 },
      [EngineeringCollegeTier.OTHER_IIIT]: { perYear: 200000, total4Years: 800000, hostelAdditional: 300000 },
      [EngineeringCollegeTier.BITS]: { perYear: 500000, total4Years: 2000000, hostelAdditional: 600000 },
      [EngineeringCollegeTier.DTU_NSIT]: { perYear: 150000, total4Years: 600000, hostelAdditional: 250000 },
      [EngineeringCollegeTier.TOP_STATE_GOV]: { perYear: 120000, total4Years: 480000, hostelAdditional: 250000 },
      [EngineeringCollegeTier.OTHER_STATE_GOV]: { perYear: 100000, total4Years: 400000, hostelAdditional: 200000 },
      [EngineeringCollegeTier.PRIVATE_TIER1]: { perYear: 400000, total4Years: 1600000, hostelAdditional: 500000 },
      [EngineeringCollegeTier.PRIVATE_TIER2]: { perYear: 250000, total4Years: 1000000, hostelAdditional: 400000 },
      [EngineeringCollegeTier.PRIVATE_TIER3]: { perYear: 150000, total4Years: 600000, hostelAdditional: 300000 },
    };
    
    return fees[tier] || fees[EngineeringCollegeTier.PRIVATE_TIER3];
  }
  
  /**
   * Get default placement stats for college tier
   */
  private getDefaultPlacement(tier: EngineeringCollegeTier) {
    const placements: Record<EngineeringCollegeTier, { tier: PlacementTier; averagePackage: number; medianPackage: number; placementPercentage: number }> = {
      [EngineeringCollegeTier.OLD_IIT]: { tier: PlacementTier.TIER_1, averagePackage: 2500000, medianPackage: 1800000, placementPercentage: 95 },
      [EngineeringCollegeTier.NEW_IIT]: { tier: PlacementTier.TIER_2, averagePackage: 1500000, medianPackage: 1200000, placementPercentage: 90 },
      [EngineeringCollegeTier.TOP_NIT]: { tier: PlacementTier.TIER_2, averagePackage: 1200000, medianPackage: 900000, placementPercentage: 85 },
      [EngineeringCollegeTier.OTHER_NIT]: { tier: PlacementTier.TIER_3, averagePackage: 900000, medianPackage: 700000, placementPercentage: 80 },
      [EngineeringCollegeTier.IIIT_HYDERABAD]: { tier: PlacementTier.TIER_1, averagePackage: 2500000, medianPackage: 2000000, placementPercentage: 98 },
      [EngineeringCollegeTier.IIIT_BANGALORE]: { tier: PlacementTier.TIER_2, averagePackage: 1800000, medianPackage: 1500000, placementPercentage: 95 },
      [EngineeringCollegeTier.OTHER_IIIT]: { tier: PlacementTier.TIER_2, averagePackage: 1200000, medianPackage: 900000, placementPercentage: 85 },
      [EngineeringCollegeTier.BITS]: { tier: PlacementTier.TIER_2, averagePackage: 1500000, medianPackage: 1200000, placementPercentage: 92 },
      [EngineeringCollegeTier.DTU_NSIT]: { tier: PlacementTier.TIER_2, averagePackage: 1100000, medianPackage: 800000, placementPercentage: 85 },
      [EngineeringCollegeTier.TOP_STATE_GOV]: { tier: PlacementTier.TIER_3, averagePackage: 700000, medianPackage: 550000, placementPercentage: 70 },
      [EngineeringCollegeTier.OTHER_STATE_GOV]: { tier: PlacementTier.TIER_3, averagePackage: 550000, medianPackage: 450000, placementPercentage: 65 },
      [EngineeringCollegeTier.PRIVATE_TIER1]: { tier: PlacementTier.TIER_3, averagePackage: 600000, medianPackage: 450000, placementPercentage: 70 },
      [EngineeringCollegeTier.PRIVATE_TIER2]: { tier: PlacementTier.TIER_4, averagePackage: 450000, medianPackage: 350000, placementPercentage: 60 },
      [EngineeringCollegeTier.PRIVATE_TIER3]: { tier: PlacementTier.TIER_4, averagePackage: 350000, medianPackage: 300000, placementPercentage: 50 },
    };
    
    return placements[tier] || placements[EngineeringCollegeTier.PRIVATE_TIER3];
  }
  
  /**
   * Get top recruiters for college tier
   */
  private getTopRecruiters(tier: EngineeringCollegeTier): string[] {
    const tier1Recruiters = ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Uber', 'Adobe', 'Apple'];
    const tier2Recruiters = ['Infosys', 'TCS', 'Wipro', 'Accenture', 'Cognizant', 'Capgemini', 'Deloitte'];
    const tier3Recruiters = ['HCL', 'Tech Mahindra', 'Mindtree', 'LTI', 'Mphasis', 'Hexaware'];
    
    if (this.isTierAtOrAbove(tier, EngineeringCollegeTier.NEW_IIT)) return tier1Recruiters;
    if (this.isTierAtOrAbove(tier, EngineeringCollegeTier.BITS)) return [...tier1Recruiters.slice(0, 4), ...tier2Recruiters];
    if (this.isTierAtOrAbove(tier, EngineeringCollegeTier.TOP_STATE_GOV)) return tier2Recruiters;
    return tier3Recruiters;
  }
  
  /**
   * Get opportunities for college tier
   */
  private getOpportunities(tier: EngineeringCollegeTier): JEEOutcome['opportunities'] {
    const highTier = this.isTierAtOrAbove(tier, EngineeringCollegeTier.NEW_IIT) || tier === EngineeringCollegeTier.IIIT_HYDERABAD;
    const midTier = this.isTierAtOrAbove(tier, EngineeringCollegeTier.TOP_STATE_GOV);
    
    return {
      higherEducationAbroad: highTier ? 'HIGH' : midTier ? 'MODERATE' : 'LOW',
      coreJobs: this.isTierAtOrAbove(tier, EngineeringCollegeTier.BITS) ? 'HIGH' : 'MODERATE',
      itJobs: 'HIGH',
      psuJobs: this.isTierAtOrAbove(tier, EngineeringCollegeTier.OTHER_NIT) ? 'HIGH' : 'MODERATE',
      mbaTopCollege: highTier ? 'HIGH' : midTier ? 'MODERATE' : 'LOW',
      startups: highTier ? 'HIGH' : 'MODERATE',
    };
  }
  
  /**
   * Check if college is accessible given constraints
   */
  private isCollegeAccessible(college: JEEOutcome, input: IndiaIntelligenceInput): boolean {
    const totalCost = college.fees.total4Years + college.fees.hostelAdditional;
    const budget = input.profile.financialConstraints.maxEducationBudget;
    const loanEligible = input.profile.financialConstraints.canTakeEducationLoan;
    
    // Check financial accessibility
    if (totalCost > budget && !loanEligible) {
      return false;
    }
    
    // Check location constraints
    if (!input.profile.canRelocate && college.location !== input.profile.homeState) {
      // Allow if it's a top-tier college (worth relocating for)
      if (!this.isTierAtOrAbove(college.collegeTier, EngineeringCollegeTier.NEW_IIT)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Analyze drop year option
   */
  private analyzeDropYearOption(
    attempts: ExamAttempt[],
    currentRank: number | undefined,
    input: IndiaIntelligenceInput
  ): JEEPathwayAnalysis {
    const dropYearsTaken = attempts.filter(a => a.wasDropYear).length;
    const canTakeAnotherDrop = dropYearsTaken < this.config.maxDropYears;
    
    if (!canTakeAnotherDrop || !currentRank) {
      return {
        recommended: false,
        confidence: 0,
        expectedImprovement: { rankImprovement: 0, tierUpgradeProbability: 0 },
        risks: {
          noImprovementProbability: 0.3,
          mentalHealthRisk: 'HIGH',
          opportunityCost: 1,
        },
        requirements: {
          coachingRecommended: true,
          estimatedCost: 300000,
          dedicationRequired: 'EXTREME',
        },
      };
    }
    
    // Calculate expected improvement
    const rankImprovement = this.calculateExpectedRankImprovement(currentRank, input);
    const tierUpgradeProb = this.calculateTierUpgradeProbability(currentRank, rankImprovement);
    
    // Determine if drop year is recommended
    const recommended = rankImprovement >= this.config.minRankImprovementForDropYear &&
                       tierUpgradeProb >= 0.4;
    
    return {
      recommended,
      confidence: tierUpgradeProb,
      expectedImprovement: {
        rankImprovement,
        tierUpgradeProbability: tierUpgradeProb,
      },
      risks: {
        noImprovementProbability: 0.25,
        mentalHealthRisk: dropYearsTaken > 0 ? 'HIGH' : 'MODERATE',
        opportunityCost: 1,
      },
      requirements: {
        coachingRecommended: true,
        coachingLocation: currentRank > 50000 ? 'KOTA' : 'HYDERABAD',
        estimatedCost: 300000,
        dedicationRequired: 'EXTREME',
      },
    };
  }
  
  /**
   * Calculate expected rank improvement from drop year
   */
  private calculateExpectedRankImprovement(currentRank: number, input: IndiaIntelligenceInput): number {
    // Base improvement expectation
    let improvement = currentRank * 0.3; // 30% improvement expected
    
    // Adjust based on academic performance
    if (input.profile.academicPerformance.class10Percentage > 90) {
      improvement *= 1.2;
    }
    
    // Adjust based on coaching access
    if (input.profile.financialConstraints.canTakeEducationLoan) {
      improvement *= 1.15; // Can afford better coaching
    }
    
    return Math.min(improvement, currentRank * 0.7); // Cap at 70% improvement
  }
  
  /**
   * Calculate probability of tier upgrade
   */
  private calculateTierUpgradeProbability(currentRank: number, improvement: number): number {
    const newRank = currentRank - improvement;
    
    // Check if rank crosses tier boundaries
    const currentTier = this.getTierFromRank(currentRank);
    const newTier = this.getTierFromRank(newRank);
    
    if (newTier < currentTier) {
      return 0.6; // 60% chance of tier upgrade
    }
    
    return 0.2; // 20% chance even without tier upgrade
  }
  
  /**
   * Get tier from rank
   */
  private getTierFromRank(rank: number): EngineeringCollegeTier {
    if (rank <= 15000) return EngineeringCollegeTier.OLD_IIT;
    if (rank <= 50000) return EngineeringCollegeTier.TOP_NIT;
    if (rank <= 100000) return EngineeringCollegeTier.TOP_STATE_GOV;
    return EngineeringCollegeTier.PRIVATE_TIER1;
  }

  private getTierRank(tier: EngineeringCollegeTier): number {
    return ENGINEERING_COLLEGE_TIER_RANK[tier];
  }

  private isTierAtOrAbove(
    tier: EngineeringCollegeTier,
    threshold: EngineeringCollegeTier
  ): boolean {
    return this.getTierRank(tier) <= this.getTierRank(threshold);
  }
  
  /**
   * Generate state CET options
   */
  private generateStateCETOptions(input: IndiaIntelligenceInput): JEEOutcome[] {
    // This would be state-specific
    // For now, return generic state college options
    return this.generateStateCollegeOptions(100000, input.profile.homeState);
  }
  
  /**
   * Generate private college options
   */
  private generatePrivateCollegeOptions(input: IndiaIntelligenceInput): JEEOutcome[] {
    return this.generateAffordablePrivateOptions(input);
  }
  
  /**
   * Analyze tier vs branch tradeoff
   */
  private analyzeTierVsBranch(
    colleges: JEEOutcome[],
    input: IndiaIntelligenceInput
  ): TierVsBranchTradeoff {
    // Find highest tier with non-CSE branch
    const higherTierLowerBranch = colleges
      .filter(c => this.isTierAtOrAbove(c.collegeTier, EngineeringCollegeTier.TOP_NIT))
      .sort((a, b) => this.getTierRank(a.collegeTier) - this.getTierRank(b.collegeTier))[0];
    
    // Find lower tier with CSE branch
    const lowerTierHigherBranch = colleges
      .filter(c => c.branch === EngineeringBranch.CSE)
      .sort((a, b) => this.getTierRank(b.collegeTier) - this.getTierRank(a.collegeTier))[0];
    
    const recommendation: 'TIER' | 'BRANCH' | 'CONTEXT_DEPENDENT' = 
      input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE 
        ? 'BRANCH' // For lower income, CSE offers better ROI
        : 'CONTEXT_DEPENDENT';
    
    return {
      higherTierLowerBranch: higherTierLowerBranch ? {
        option: { ...higherTierLowerBranch, branch: EngineeringBranch.MECHANICAL },
        pros: ['Better alumni network', 'More prestigious', 'Better higher studies options', 'PSU eligibility'],
        cons: ['Lower initial salary', 'Limited IT job options', 'Core sector dependence'],
        bestFor: ['Students planning MS/MTech', 'PSU aspirants', 'Research interest'],
      } : undefined,
      lowerTierHigherBranch: lowerTierHigherBranch ? {
        option: lowerTierHigherBranch,
        pros: ['Higher starting salary', 'More IT job options', 'Startup friendly', 'Better immediate ROI'],
        cons: ['Less prestigious college', 'Limited PSU options', 'Weaker alumni network'],
        bestFor: ['Immediate income priority', 'IT/Software interest', 'Startup plans'],
      } : undefined,
      recommendation,
      rationale: recommendation === 'BRANCH' 
        ? 'For your economic background, CSE offers faster financial returns'
        : 'Consider your long-term goals: brand matters for higher studies, branch matters for immediate employment',
    };
  }
  
  /**
   * Analyze college vs location tradeoff
   */
  private analyzeCollegeVsLocation(
    colleges: JEEOutcome[],
    input: IndiaIntelligenceInput
  ): CollegeVsLocationTradeoff {
    const betterCollegeFar = colleges
      .filter(c => c.location !== input.profile.homeState)
      .sort((a, b) => this.getTierRank(a.collegeTier) - this.getTierRank(b.collegeTier))[0];
    
    const worseCollegeNear = colleges
      .filter(c => c.location === input.profile.homeState)
      .sort((a, b) => this.getTierRank(a.collegeTier) - this.getTierRank(b.collegeTier))[0];
    
    return {
      betterCollegeFar: betterCollegeFar ? {
        option: betterCollegeFar,
        relocation: true,
        pros: ['Better college reputation', 'Better placements', 'Exposure to new city', 'Independence'],
        cons: ['Higher costs (travel, living)', 'Away from family support', 'Cultural adjustment'],
      } : undefined,
      worseCollegeNear: worseCollegeNear ? {
        option: worseCollegeNear,
        pros: ['Lower costs', 'Family support', 'Known environment', 'Local network'],
        cons: ['Lower tier college', 'Limited exposure', 'Potentially weaker placements'],
      } : undefined,
      recommendation: input.profile.canRelocate ? 'RELOCATE' : 'STAY',
    };
  }
  
  /**
   * Analyze fees vs placement tradeoff
   */
  private analyzeFeesVsPlacement(colleges: JEEOutcome[]): FeesVsPlacementTradeoff {
    const sortedByPlacement = [...colleges].sort((a, b) => 
      b.placement.averagePackage - a.placement.averagePackage
    );
    
    const expensiveGoodPlacements = sortedByPlacement[0];
    const affordableAvgPlacements = sortedByPlacement.find(c => 
      c.fees.total4Years < 1000000
    ) || sortedByPlacement[sortedByPlacement.length - 1];
    
    return {
      expensiveGoodPlacements: expensiveGoodPlacements ? {
        option: expensiveGoodPlacements,
        roi: (expensiveGoodPlacements.placement.averagePackage * 4) / 
             expensiveGoodPlacements.fees.total4Years,
        loanRequired: expensiveGoodPlacements.fees.total4Years > 1500000,
      } : undefined,
      affordableAveragePlacements: affordableAvgPlacements ? {
        option: affordableAvgPlacements,
        roi: (affordableAvgPlacements.placement.averagePackage * 4) / 
             affordableAvgPlacements.fees.total4Years,
      } : undefined,
      recommendation: 'CONTEXT_DEPENDENT',
    };
  }
  
  /**
   * Generate final recommendations
   */
  private generateRecommendations(
    colleges: JEEOutcome[],
    dropYearAnalysis: JEEPathwayAnalysis,
    input: IndiaIntelligenceInput
  ): JEEAnalysis['recommendations'] {
    const recommendations: JEEAnalysis['recommendations'] = {
      rationale: [],
      warnings: [],
    };
    
    // Determine optimal choice
    if (dropYearAnalysis.recommended && dropYearAnalysis.confidence > 0.5) {
      recommendations.rationale.push('Drop year recommended due to potential for significant rank improvement');
      recommendations.warnings.push('Drop year involves mental health risks and opportunity cost');
    } else if (colleges.length > 0) {
      // Choose best college based on criteria
      const bestCollege = this.selectOptimalCollege(colleges, input);
      recommendations.optimalChoice = bestCollege;
      recommendations.rationale.push(`Based on your constraints, ${bestCollege.collegeName} offers the best balance of cost, location, and career outcomes`);
    }
    
    // Add warnings based on constraints
    if (input.profile.financialConstraints.loanTolerance === 'NONE' && 
        colleges.some(c => c.fees.total4Years > input.profile.financialConstraints.maxEducationBudget)) {
      recommendations.warnings.push('Your budget constraints significantly limit college options. Consider education loans for better colleges.');
    }
    
    if (!input.profile.canRelocate) {
      recommendations.warnings.push('Reluctance to relocate limits you to local colleges, which may affect long-term career options');
    }
    
    return recommendations;
  }
  
  /**
   * Select optimal college based on multiple criteria
   */
  private selectOptimalCollege(
    colleges: JEEOutcome[],
    input: IndiaIntelligenceInput
  ): JEEOutcome {
    // Score each college
    const scoredColleges = colleges.map(college => {
      let score = 0;
      
      // Placement score (40%)
      score += (college.placement.averagePackage / 3000000) * 40;
      
      // Tier score (30%)
      const tierScore = 1 - (this.getTierRank(college.collegeTier) / 15);
      score += tierScore * 30;
      
      // Affordability score (20%)
      const totalCost = college.fees.total4Years + college.fees.hostelAdditional;
      const budget = input.profile.financialConstraints.maxEducationBudget;
      const affordability = Math.min(budget / totalCost, 1);
      score += affordability * 20;
      
      // Location score (10%)
      if (college.location === input.profile.homeState) {
        score += 10;
      }
      
      return { college, score };
    });
    
    // Return highest scored college
    scoredColleges.sort((a, b) => b.score - a.score);
    return scoredColleges[0].college;
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<JEEEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for JEE Engine
 */
export function createJEEEngine(config?: Partial<JEEEngineConfig>): JEEEngine {
  return new JEEEngine(config);
}
