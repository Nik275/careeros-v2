/**
 * India Intelligence - NEET Engine
 * 
 * Models the complete medical education ecosystem including:
 * - NEET exam and rank-based admissions
 * - Government vs Private vs Abroad MBBS options
 * - Alternative paths (BDS, BAMS, BHMS, Nursing)
 * - Specialization and career pathways
 * - Financial analysis and ROI calculations
 * 
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  NEETAnalysis,
  MedicalSeat,
  AbroadMedicalOption,
  AlternativeMedicalPath,
  MedicalFinancialAnalysis,
  NEETRecommendation,
  ExamAttempt,
  MedicalEducationPath,
  EconomicStratum,
} from '../types';

/**
 * NEET Engine Configuration
 */
export interface NEETEngineConfig {
  /** Maximum attempts for NEET */
  maxAttempts: number;
  /** Consider MBBS abroad as viable option */
  considerAbroadOption: boolean;
  /** Minimum rank for government MBBS consideration */
  minRankForGovtMBBS: number;
  /** Maximum budget for MBBS abroad consideration */
  maxBudgetForAbroadMBBS: number;
}

/**
 * Default NEET Engine configuration
 */
export const DEFAULT_NEET_CONFIG: NEETEngineConfig = {
  maxAttempts: 3,
  considerAbroadOption: true,
  minRankForGovtMBBS: 15000,
  maxBudgetForAbroadMBBS: 5000000, // 50 Lakhs
};

/**
 * NEET Engine
 * 
 * Analyzes medical education pathways
 */
export class NEETEngine {
  private config: NEETEngineConfig;
  
  constructor(config: Partial<NEETEngineConfig> = {}) {
    this.config = { ...DEFAULT_NEET_CONFIG, ...config };
  }
  
  /**
   * Analyze NEET pathway for a student
   */
  analyze(input: IndiaIntelligenceInput): NEETAnalysis {
    const neetAttempts = this.extractNEETAttempts(input.profile.examAttempts);
    const bestRank = this.getBestNEETRank(neetAttempts);
    const bestScore = this.getBestNEETScore(neetAttempts);
    
    // Generate eligible seats
    const eligibleSeats = bestRank ? this.generateEligibleSeats(bestRank, input) : [];
    
    // Generate pathway options
    const governmentMBBS = eligibleSeats.filter(s => s.type === MedicalEducationPath.MBBS_GOV);
    const privateMBBSIndia = this.generatePrivateMBBSOptions(bestRank, input);
    const mbbsAbroad = this.generateAbroadOptions(input);
    const alternativeMedical = this.generateAlternativePaths(bestRank, input);
    
    // Generate long-term outlook
    const specializationPathways = this.generateSpecializationPaths();
    const practiceOptions = this.generatePracticeOptions();
    const employmentOptions = this.generateEmploymentOptions();
    
    // Financial analysis
    const financialAnalysis = this.analyzeFinancials(
      governmentMBBS[0],
      privateMBBSIndia[0],
      mbbsAbroad[0],
      input
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      bestRank,
      governmentMBBS,
      privateMBBSIndia,
      mbbsAbroad,
      alternativeMedical,
      financialAnalysis,
      input
    );
    
    return {
      currentStatus: {
        neetRank: bestRank,
        neetScore: bestScore,
        percentile: bestRank ? this.calculatePercentile(bestRank) : undefined,
        eligibleSeats,
      },
      pathwayOptions: {
        governmentMBBS,
        privateMBBSIndia,
        mbbsAbroad,
        alternativeMedical,
      },
      longTermOutlook: {
        specializationPathways,
        practiceOptions,
        employmentOptions,
      },
      financialAnalysis,
      recommendations,
    };
  }
  
  /**
   * Extract NEET attempts
   */
  private extractNEETAttempts(attempts: ExamAttempt[]): ExamAttempt[] {
    return attempts.filter(a => a.examType === 'NEET');
  }
  
  /**
   * Get best NEET rank
   */
  private getBestNEETRank(attempts: ExamAttempt[]): number | undefined {
    const rankedAttempts = attempts
      .filter(a => a.rank && a.rank > 0)
      .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
    
    return rankedAttempts[0]?.rank;
  }
  
  /**
   * Get best NEET score
   */
  private getBestNEETScore(attempts: ExamAttempt[]): number | undefined {
    return attempts
      .filter(a => a.score)
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.score;
  }
  
  /**
   * Calculate percentile from rank
   */
  private calculatePercentile(rank: number): number {
    // Assuming ~20 lakh candidates
    const totalCandidates = 2000000;
    return ((totalCandidates - rank) / totalCandidates) * 100;
  }
  
  /**
   * Generate eligible seats based on rank
   */
  private generateEligibleSeats(
    rank: number,
    input: IndiaIntelligenceInput
  ): MedicalSeat[] {
    const seats: MedicalSeat[] = [];
    
    // Government MBBS seats (highly competitive)
    if (rank <= this.config.minRankForGovtMBBS) {
      seats.push(...this.generateGovernmentMBBS(rank, input));
    }
    
    // Government BDS seats
    if (rank <= 50000) {
      seats.push(...this.generateGovernmentBDS(rank, input));
    }
    
    // Government AYUSH seats
    if (rank <= 100000) {
      seats.push(...this.generateGovernmentAYUSH(rank, input));
    }
    
    return seats.filter(s => this.isSeatAccessible(s, input));
  }
  
  /**
   * Generate government MBBS options
   */
  private generateGovernmentMBBS(rank: number, input: IndiaIntelligenceInput): MedicalSeat[] {
    const seats: MedicalSeat[] = [];
    
    // AIIMS (top rankers)
    if (rank <= 2000) {
      const aiims = [
        { name: 'AIIMS New Delhi', cutoff: 100 },
        { name: 'AIIMS Bhopal', cutoff: 800 },
        { name: 'AIIMS Jodhpur', cutoff: 1000 },
        { name: 'AIIMS Rishikesh', cutoff: 1200 },
        { name: 'AIIMS Bhubaneswar', cutoff: 1400 },
      ];
      
      for (const college of aiims) {
        if (rank <= college.cutoff) {
          seats.push({
            type: MedicalEducationPath.MBBS_GOV,
            collegeName: college.name,
            location: this.getLocationFromName(college.name),
            fees: { totalTuition: 10000, perYear: 2000, additionalCosts: 50000 },
            cutOffRank: college.cutoff,
            quota: 'ALL_INDIA',
            seatAvailability: rank <= college.cutoff * 0.8 ? 'CONFIRMED' : 'LIKELY',
            bond: { required: false, years: 0, penalty: 0 },
          });
        }
      }
    }
    
    // Other government colleges
    const govtColleges = [
      { name: 'MAMC Delhi', cutoff: 800, state: 'Delhi' },
      { name: 'LHMC Delhi', cutoff: 1200, state: 'Delhi' },
      { name: 'UCMS Delhi', cutoff: 1500, state: 'Delhi' },
      { name: 'Seth GS Mumbai', cutoff: 2000, state: 'Maharashtra' },
      { name: 'BJMC Pune', cutoff: 3000, state: 'Maharashtra' },
      { name: 'Stanley Chennai', cutoff: 4000, state: 'Tamil Nadu' },
      { name: 'MMC Chennai', cutoff: 3500, state: 'Tamil Nadu' },
      { name: 'KGMU Lucknow', cutoff: 3500, state: 'Uttar Pradesh' },
      { name: 'BHU Varanasi', cutoff: 5000, state: 'Uttar Pradesh' },
      { name: 'IPGMER Kolkata', cutoff: 4500, state: 'West Bengal' },
    ];
    
    for (const college of govtColleges) {
      if (rank <= college.cutoff) {
        const isHomeState = college.state.toLowerCase() === input.profile.homeState.toLowerCase();
        seats.push({
          type: MedicalEducationPath.MBBS_GOV,
          collegeName: college.name,
          location: college.state,
          fees: { totalTuition: 50000, perYear: 10000, additionalCosts: 100000 },
          cutOffRank: college.cutoff,
          quota: isHomeState ? 'STATE' : 'ALL_INDIA',
          seatAvailability: isHomeState ? 'CONFIRMED' : rank <= college.cutoff * 0.7 ? 'LIKELY' : 'POSSIBLE',
          bond: { required: true, years: 2, penalty: 1000000 },
        });
      }
    }
    
    return seats;
  }
  
  /**
   * Generate government BDS options
   */
  private generateGovernmentBDS(rank: number, input: IndiaIntelligenceInput): MedicalSeat[] {
    const seats: MedicalSeat[] = [];
    
    if (rank <= 20000) {
      seats.push({
        type: MedicalEducationPath.BDS_GOV,
        collegeName: 'Government Dental College (Representative)',
        location: input.profile.homeState,
        fees: { totalTuition: 200000, perYear: 50000, additionalCosts: 100000 },
        cutOffRank: 20000,
        quota: 'STATE',
        seatAvailability: 'LIKELY',
        bond: { required: false, years: 0, penalty: 0 },
      });
    }
    
    return seats;
  }
  
  /**
   * Generate government AYUSH options
   */
  private generateGovernmentAYUSH(rank: number, input: IndiaIntelligenceInput): MedicalSeat[] {
    const seats: MedicalSeat[] = [];
    
    if (rank <= 50000) {
      seats.push({
        type: MedicalEducationPath.BAMS_GOV,
        collegeName: 'Government Ayurvedic College (Representative)',
        location: input.profile.homeState,
        fees: { totalTuition: 300000, perYear: 60000, additionalCosts: 80000 },
        cutOffRank: 50000,
        quota: 'STATE',
        seatAvailability: 'LIKELY',
        bond: { required: false, years: 0, penalty: 0 },
      });
    }
    
    if (rank <= 75000) {
      seats.push({
        type: MedicalEducationPath.BHMS_GOV,
        collegeName: 'Government Homeopathic College (Representative)',
        location: input.profile.homeState,
        fees: { totalTuition: 250000, perYear: 50000, additionalCosts: 70000 },
        cutOffRank: 75000,
        quota: 'STATE',
        seatAvailability: 'LIKELY',
        bond: { required: false, years: 0, penalty: 0 },
      });
    }
    
    return seats;
  }
  
  /**
   * Generate private MBBS options
   */
  private generatePrivateMBBS(rank: number, input: IndiaIntelligenceInput): MedicalSeat[] {
    const seats: MedicalSeat[] = [];
    const budget = input.profile.financialConstraints.maxEducationBudget;
    
    // Private MBBS is expensive - 50L to 1.5Cr
    if (budget >= 5000000) {
      seats.push({
        type: MedicalEducationPath.MBBS_PRIVATE_INDIA,
        collegeName: 'Private Medical College (Management Quota)',
        location: input.profile.homeState,
        fees: { totalTuition: 8000000, perYear: 2000000, additionalCosts: 500000 },
        cutOffRank: 500000,
        quota: 'MANAGEMENT',
        seatAvailability: 'CONFIRMED',
        bond: { required: false, years: 0, penalty: 0 },
      });
    }
    
    return seats;
  }
  
  /**
   * Generate abroad MBBS options
   */
  private generateAbroadOptions(input: IndiaIntelligenceInput): AbroadMedicalOption[] {
    const options: AbroadMedicalOption[] = [];
    const budget = input.profile.financialConstraints.maxEducationBudget;
    
    if (!this.config.considerAbroadOption) return options;
    if (budget < 2500000) return options; // Minimum 25L for abroad
    
    // Russia
    if (budget >= 3000000) {
      options.push({
        country: 'Russia',
        popularDestinations: ['Moscow', 'St. Petersburg', 'Kazan'],
        fees: { tuition: 2500000, living: 1500000, total: 4000000 },
        duration: 6,
        recognition: {
          mciRecognized: true,
          screeningTestRequired: true,
          practiceInIndia: 'AFTER_FMGE',
        },
        pros: ['Affordable fees', 'No entrance exam', 'Good infrastructure', 'English medium'],
        cons: ['FMGE pass rate ~20%', 'Cold climate', 'Cultural adjustment', '6 year duration'],
        suitableFor: ['Budget constraint', 'Willing to study abroad', 'Flexible timeline'],
      });
    }
    
    // Ukraine (currently suspended due to war, but included for completeness)
    // Georgia
    if (budget >= 3500000) {
      options.push({
        country: 'Georgia',
        popularDestinations: ['Tbilisi', 'Batumi'],
        fees: { tuition: 2800000, living: 1200000, total: 4000000 },
        duration: 6,
        recognition: {
          mciRecognized: true,
          screeningTestRequired: true,
          practiceInIndia: 'AFTER_FMGE',
        },
        pros: ['European standard', 'English medium', 'Safe environment'],
        cons: ['FMGE required', 'Moderate cost', 'Limited Indian community'],
        suitableFor: ['Quality education priority', 'European exposure'],
      });
    }
    
    // Philippines
    if (budget >= 3500000) {
      options.push({
        country: 'Philippines',
        popularDestinations: ['Manila', 'Cebu'],
        fees: { tuition: 2500000, living: 1500000, total: 4000000 },
        duration: 6,
        recognition: {
          mciRecognized: true,
          screeningTestRequired: true,
          practiceInIndia: 'AFTER_FMGE',
        },
        pros: ['English speaking country', 'US-based curriculum', 'Tropical climate', 'Large Indian community'],
        cons: ['BS-MD program (1.5+4 years)', 'FMGE required', 'Variable college quality'],
        suitableFor: ['English comfort', 'USMLE preparation', 'Tropical preference'],
      });
    }
    
    // Caribbean
    if (budget >= 6000000) {
      options.push({
        country: 'Caribbean',
        popularDestinations: ['Barbados', 'St. Lucia', 'Guyana'],
        fees: { tuition: 5000000, living: 2000000, total: 7000000 },
        duration: 5,
        recognition: {
          mciRecognized: false,
          screeningTestRequired: true,
          practiceInIndia: 'AFTER_FMGE',
        },
        pros: ['US clinical rotations', 'USMLE focused', 'English medium'],
        cons: ['Expensive', 'Not MCI recognized directly', 'FMGE required'],
        suitableFor: ['US practice goal', 'High budget', 'USMLE focused'],
      });
    }
    
    return options;
  }
  
  /**
   * Generate alternative medical paths
   */
  private generateAlternativePaths(
    rank: number,
    input: IndiaIntelligenceInput
  ): AlternativeMedicalPath[] {
    const paths: AlternativeMedicalPath[] = [];
    
    // BDS
    paths.push({
      path: 'BDS',
      duration: 5,
      fees: 300000,
      careerProspects: {
        governmentJobs: 'LOW',
        privatePractice: 'HIGH',
        abroadOpportunities: 'MODERATE',
        incomePotential: 'MODERATE',
      },
      comparisonWithMBBS: 'Shorter duration, lower fees, good private practice potential, but limited government job scope compared to MBBS',
    });
    
    // BAMS
    paths.push({
      path: 'BAMS',
      duration: 5.5,
      fees: 400000,
      careerProspects: {
        governmentJobs: 'MODERATE',
        privatePractice: 'MODERATE',
        abroadOpportunities: 'LOW',
        incomePotential: 'MODERATE',
      },
      comparisonWithMBBS: 'Growing acceptance, government support for AYUSH, integrated medicine opportunities, but limited compared to MBBS',
    });
    
    // BHMS
    paths.push({
      path: 'BHMS',
      duration: 5.5,
      fees: 350000,
      careerProspects: {
        governmentJobs: 'LOW',
        privatePractice: 'MODERATE',
        abroadOpportunities: 'LOW',
        incomePotential: 'LOW',
      },
      comparisonWithMBBS: 'Niche practice area, growing but limited scope compared to MBBS',
    });
    
    // BUMS
    paths.push({
      path: 'BUMS',
      duration: 5.5,
      fees: 400000,
      careerProspects: {
        governmentJobs: 'LOW',
        privatePractice: 'MODERATE',
        abroadOpportunities: 'LOW',
        incomePotential: 'MODERATE',
      },
      comparisonWithMBBS: 'Community-specific demand, limited general scope',
    });
    
    // Nursing
    paths.push({
      path: 'NURSING',
      duration: 4,
      fees: 200000,
      careerProspects: {
        governmentJobs: 'MODERATE',
        privatePractice: 'LOW',
        abroadOpportunities: 'HIGH',
        incomePotential: 'MODERATE',
      },
      comparisonWithMBBS: 'High demand abroad, shorter duration, different role, good income potential overseas',
    });
    
    // Allied Health
    paths.push({
      path: 'ALLIED_HEALTH',
      duration: 4,
      fees: 300000,
      careerProspects: {
        governmentJobs: 'MODERATE',
        privatePractice: 'MODERATE',
        abroadOpportunities: 'MODERATE',
        incomePotential: 'MODERATE',
      },
      comparisonWithMBBS: 'Specialized technical roles, growing demand, good work-life balance',
    });
    
    return paths;
  }
  
  /**
   * Generate specialization pathways
   */
  private generateSpecializationPaths() {
    return [
      {
        field: 'Medicine/General Physician',
        superSpecialization: ['Cardiology', 'Nephrology', 'Neurology', 'Endocrinology'],
        duration: 5, // MD + DM
        entranceRequired: 'NEET_PG',
        competitionLevel: 'EXTREME' as const,
        incomePotential: 2500000,
      },
      {
        field: 'Surgery',
        superSpecialization: ['Cardiac Surgery', 'Neurosurgery', 'Orthopedics', 'Plastic Surgery'],
        duration: 5,
        entranceRequired: 'NEET_PG',
        competitionLevel: 'EXTREME' as const,
        incomePotential: 3000000,
      },
      {
        field: 'Pediatrics',
        superSpecialization: ['Neonatology', 'Pediatric Surgery', 'Pediatric Cardiology'],
        duration: 5,
        entranceRequired: 'NEET_PG',
        competitionLevel: 'HIGH' as const,
        incomePotential: 2000000,
      },
      {
        field: 'Obstetrics & Gynecology',
        superSpecialization: ['Reproductive Medicine', 'Maternal-Fetal Medicine', 'Gynecologic Oncology'],
        duration: 5,
        entranceRequired: 'NEET_PG',
        competitionLevel: 'HIGH' as const,
        incomePotential: 2200000,
      },
      {
        field: 'Radiology',
        superSpecialization: ['Interventional Radiology', 'Neuroradiology'],
        duration: 4,
        entranceRequired: 'NEET_PG',
        competitionLevel: 'EXTREME' as const,
        incomePotential: 3500000,
      },
      {
        field: 'Dermatology',
        superSpecialization: ['Dermatosurgery', 'Cosmetology'],
        duration: 4,
        entranceRequired: 'NEET_PG',
        competitionLevel: 'HIGH' as const,
        incomePotential: 2800000,
      },
    ];
  }
  
  /**
   * Generate practice options
   */
  private generatePracticeOptions() {
    return [
      {
        type: 'OWN_CLINIC' as const,
        initialInvestment: 5000000,
        timeline: '5-10 years post MBBS',
        incomeTrajectory: 'GROWING',
        lifestyle: 'DEMANDING',
        requirements: ['MBBS + MD/MS', 'Registration', 'Location', 'Initial capital'],
      },
      {
        type: 'HOSPITAL_EMPLOYMENT' as const,
        initialInvestment: 0,
        timeline: 'Immediate post MBBS',
        incomeTrajectory: 'STEADY',
        lifestyle: 'DEMANDING',
        requirements: ['MBBS', 'State registration'],
      },
      {
        type: 'GOVERNMENT_HOSPITAL' as const,
        initialInvestment: 0,
        timeline: 'Post completion of bond (if any)',
        incomeTrajectory: 'STEADY',
        lifestyle: 'BALANCED',
        requirements: ['MBBS', 'Clear government exam'],
      },
      {
        type: 'TEACHING' as const,
        initialInvestment: 0,
        timeline: 'After PG',
        incomeTrajectory: 'STEADY',
        lifestyle: 'BALANCED',
        requirements: ['MD/MS', 'Teaching aptitude'],
      },
    ];
  }
  
  /**
   * Generate employment options
   */
  private generateEmploymentOptions() {
    return [
      {
        employer: 'Corporate Hospital (Apollo, Fortis, Max)',
        role: 'Resident Doctor → Consultant',
        startingSalary: 800000,
        growthTrajectory: '20-25% per year',
        workLifeBalance: 'DEMANDING',
      },
      {
        employer: 'Government Hospital',
        role: 'Medical Officer → Specialist',
        startingSalary: 1200000,
        growthTrajectory: '8-10% per year with regular increments',
        workLifeBalance: 'BALANCED',
      },
      {
        employer: 'Multi-specialty Clinic',
        role: 'Junior Doctor → Partner',
        startingSalary: 600000,
        growthTrajectory: 'Variable, partnership potential',
        workLifeBalance: 'MODERATE',
      },
      {
        employer: 'Overseas (UK, US, Middle East)',
        role: 'Doctor → Specialist',
        startingSalary: 3000000,
        growthTrajectory: 'High growth potential',
        workLifeBalance: 'VARIES',
      },
    ];
  }
  
  /**
   * Analyze financials for different paths
   */
  private analyzeFinancials(
    govtSeat: MedicalSeat | undefined,
    privateSeat: MedicalSeat | undefined,
    abroadOption: AbroadMedicalOption | undefined,
    input: IndiaIntelligenceInput
  ): MedicalFinancialAnalysis {
    const budget = input.profile.financialConstraints.maxEducationBudget;
    
    // Determine chosen path
    let totalInvestment = 0;
    let roiTimeline = 0;
    let loanRequired = false;
    let recommendedLoanAmount = 0;
    
    if (govtSeat) {
      totalInvestment = govtSeat.fees.totalTuition + govtSeat.fees.additionalCosts;
      roiTimeline = 3;
      loanRequired = false;
    } else if (privateSeat && budget >= privateSeat.fees.totalTuition) {
      totalInvestment = privateSeat.fees.totalTuition + privateSeat.fees.additionalCosts;
      roiTimeline = 8;
      loanRequired = totalInvestment > budget;
      recommendedLoanAmount = loanRequired ? totalInvestment - budget : 0;
    } else if (abroadOption && budget >= abroadOption.fees.total) {
      totalInvestment = abroadOption.fees.total;
      roiTimeline = 7;
      loanRequired = totalInvestment > budget;
      recommendedLoanAmount = loanRequired ? totalInvestment - budget : 0;
    } else {
      // AYUSH path
      totalInvestment = 500000;
      roiTimeline = 5;
      loanRequired = false;
    }
    
    const expectedStartingIncome = 800000;
    const incomeAt10Years = 2500000;
    
    return {
      totalInvestment,
      roiTimeline,
      loanRequired,
      recommendedLoanAmount,
      expectedStartingIncome,
      incomeAt10Years,
      comparisonWithEngineering: 'Longer duration (5.5 vs 4 years) and higher investment, but higher long-term income potential and social prestige',
    };
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(
    rank: number | undefined,
    governmentMBBS: MedicalSeat[],
    privateMBBS: MedicalSeat[],
    mbbsAbroad: AbroadMedicalOption[],
    alternative: AlternativeMedicalPath[],
    financials: MedicalFinancialAnalysis,
    input: IndiaIntelligenceInput
  ): NEETRecommendation {
    let primaryPath: NEETRecommendation['primaryPath'] = 'ALTERNATIVE';
    let secondaryPath: string | undefined;
    const rationale: string[] = [];
    const warnings: string[] = [];
    
    if (rank && rank <= this.config.minRankForGovtMBBS && governmentMBBS.length > 0) {
      primaryPath = 'GOVT_MBBS';
      rationale.push('Your NEET rank qualifies you for government MBBS seats');
      rationale.push('Government MBBS offers the best ROI and career foundation');
      
      const topChoice = governmentMBBS[0];
      if (topChoice.bond.required) {
        warnings.push(`Bond requirement: ${topChoice.bond.years} years service or ₹${topChoice.bond.penalty.toLocaleString()} penalty`);
      }
    } else if (privateMBBS.length > 0 && financials.loanRequired && input.profile.financialConstraints.loanTolerance !== 'NONE') {
      primaryPath = 'PRIVATE_MBBS';
      rationale.push('Private MBBS is an option given your financial capacity');
      rationale.push('Consider ROI carefully - significant investment but good returns');
      warnings.push('High investment required. Ensure you have loan access.');
    } else if (mbbsAbroad.length > 0 && input.profile.financialConstraints.canTakeEducationLoan) {
      primaryPath = 'MBBS_ABROAD';
      rationale.push('MBBS abroad offers an alternative path given your current rank');
      rationale.push(`${mbbsAbroad[0].country} is the most suitable option for your profile`);
      warnings.push('FMGE exam required to practice in India with ~20% pass rate');
      warnings.push('Cultural adjustment and being away from family for 6 years');
    } else {
      primaryPath = 'ALTERNATIVE';
      const bestAlternative = alternative[0];
      secondaryPath = bestAlternative?.path;
      rationale.push('Alternative medical paths offer viable career options');
      rationale.push(`${bestAlternative?.path} matches your constraints and interests`);
    }
    
    // Generate timeline
    const timeline = rank && rank <= this.config.minRankForGovtMBBS
      ? 'Counseling in July-August. College starts August-September. 5.5 year program.'
      : 'Consider next steps based on chosen path. MBBS abroad applications typically open in June.';
    
    return {
      primaryPath,
      secondaryPath,
      rationale,
      warnings,
      timeline,
    };
  }
  
  /**
   * Check if seat is accessible
   */
  private isSeatAccessible(seat: MedicalSeat, input: IndiaIntelligenceInput): boolean {
    const totalCost = seat.fees.totalTuition + seat.fees.additionalCosts;
    const budget = input.profile.financialConstraints.maxEducationBudget;
    const loanEligible = input.profile.financialConstraints.canTakeEducationLoan;
    
    // Government seats are always accessible if rank qualifies
    if (seat.type === MedicalEducationPath.MBBS_GOV) {
      return true;
    }
    
    // Check financial accessibility for private seats
    return totalCost <= budget || loanEligible;
  }
  
  /**
   * Get location from college name
   */
  private getLocationFromName(name: string): string {
    if (name.includes('Delhi')) return 'Delhi';
    if (name.includes('Mumbai')) return 'Maharashtra';
    if (name.includes('Chennai')) return 'Tamil Nadu';
    if (name.includes('Kolkata')) return 'West Bengal';
    if (name.includes('Lucknow') || name.includes('Varanasi')) return 'Uttar Pradesh';
    if (name.includes('Pune')) return 'Maharashtra';
    if (name.includes('Hyderabad')) return 'Telangana';
    return 'Unknown';
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<NEETEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for NEET Engine
 */
export function createNEETEngine(config?: Partial<NEETEngineConfig>): NEETEngine {
  return new NEETEngine(config);
}
