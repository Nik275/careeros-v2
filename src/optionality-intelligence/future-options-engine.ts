/**
 * CareerOS Optionality Intelligence Engine - Future Options Engine
 *
 * Phase D.3: Optionality Intelligence Engine
 *
 * Generates available future career paths and options.
 *
 * @module future-options-engine
 * @version 1.0.0
 */

import type {
  FutureOptions,
  FuturePath,
  PathDiversity,
  OptionalityIntelligenceConfig,
} from './optionality-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';

/**
 * Engine for generating future career options.
 */
export class FutureOptionsEngine {
  /** Configuration */
  private config: OptionalityIntelligenceConfig;

  /**
   * Creates a new FutureOptionsEngine.
   *
   * @param config - Configuration
   */
  constructor(config: OptionalityIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Generates all future options for a career.
   *
   * @param career - Career intelligence
   * @returns Complete future options
   */
  generateFutureOptions(career: CareerIntelligence): FutureOptions {
    const advantages = career.careerAdvantages;
    const metadata = career.metadata;

    // Generate primary paths (natural next steps)
    const primaryPaths = this.generatePrimaryPaths(career);

    // Generate alternative paths (lateral moves)
    const alternativePaths = this.generateAlternativePaths(career);

    // Generate expansion paths (broader scope)
    const expansionPaths = this.generateExpansionPaths(career);

    // Generate backup paths (fallback options)
    const backupPaths = this.generateBackupPaths(career);

    // Calculate total path count
    const totalPathCount =
      primaryPaths.length +
      alternativePaths.length +
      expansionPaths.length +
      backupPaths.length;

    // Calculate path diversity
    const pathDiversity = this.calculatePathDiversity(
      primaryPaths,
      alternativePaths,
      expansionPaths,
      backupPaths,
      metadata
    );

    return {
      primaryPaths,
      alternativePaths,
      expansionPaths,
      backupPaths,
      totalPathCount,
      pathDiversity,
    };
  }

  /**
   * Generates primary career paths (natural advancement).
   *
   * @param career - Career intelligence
   * @returns Primary paths
   */
  private generatePrimaryPaths(career: CareerIntelligence): FuturePath[] {
    const paths: FuturePath[] = [];
    const metadata = career.metadata;
    const category = metadata.category.toUpperCase();

    // Define primary advancement patterns by category
    const advancementPatterns: Record<string, Array<{ title: string; type: import('./optionality-types').PathType; difficulty: number }>> = {
      ENGINEERING: [
        { title: 'Senior Engineer', type: 'PROMOTION', difficulty: 30 },
        { title: 'Staff Engineer', type: 'PROMOTION', difficulty: 50 },
        { title: 'Principal Engineer', type: 'SPECIALIZATION', difficulty: 60 },
        { title: 'Engineering Manager', type: 'EXPANSION', difficulty: 55 },
      ],
      PRODUCT: [
        { title: 'Senior Product Manager', type: 'PROMOTION', difficulty: 35 },
        { title: 'Group Product Manager', type: 'PROMOTION', difficulty: 50 },
        { title: 'Director of Product', type: 'EXPANSION', difficulty: 65 },
        { title: 'VP of Product', type: 'EXPANSION', difficulty: 75 },
      ],
      MARKETING: [
        { title: 'Senior Marketing Manager', type: 'PROMOTION', difficulty: 35 },
        { title: 'Marketing Director', type: 'EXPANSION', difficulty: 55 },
        { title: 'CMO', type: 'EXPANSION', difficulty: 75 },
        { title: 'Brand Strategist', type: 'SPECIALIZATION', difficulty: 50 },
      ],
      SALES: [
        { title: 'Senior Sales Rep', type: 'PROMOTION', difficulty: 30 },
        { title: 'Sales Manager', type: 'EXPANSION', difficulty: 50 },
        { title: 'Director of Sales', type: 'EXPANSION', difficulty: 60 },
        { title: 'VP of Sales', type: 'EXPANSION', difficulty: 70 },
      ],
      FINANCE: [
        { title: 'Senior Financial Analyst', type: 'PROMOTION', difficulty: 35 },
        { title: 'Finance Manager', type: 'EXPANSION', difficulty: 50 },
        { title: 'Director of Finance', type: 'EXPANSION', difficulty: 65 },
        { title: 'CFO', type: 'EXPANSION', difficulty: 80 },
      ],
      CONSULTING: [
        { title: 'Senior Consultant', type: 'PROMOTION', difficulty: 35 },
        { title: 'Manager', type: 'PROMOTION', difficulty: 50 },
        { title: 'Partner', type: 'SPECIALIZATION', difficulty: 70 },
        { title: 'Industry Specialist', type: 'SPECIALIZATION', difficulty: 55 },
      ],
      OPERATIONS: [
        { title: 'Operations Manager', type: 'PROMOTION', difficulty: 40 },
        { title: 'Director of Operations', type: 'EXPANSION', difficulty: 55 },
        { title: 'VP of Operations', type: 'EXPANSION', difficulty: 70 },
        { title: 'COO', type: 'EXPANSION', difficulty: 80 },
      ],
      RESEARCH: [
        { title: 'Senior Researcher', type: 'PROMOTION', difficulty: 35 },
        { title: 'Research Lead', type: 'EXPANSION', difficulty: 50 },
        { title: 'Principal Scientist', type: 'SPECIALIZATION', difficulty: 65 },
        { title: 'Research Director', type: 'EXPANSION', difficulty: 70 },
      ],
    };

    const patterns = advancementPatterns[category] ?? [
      { title: 'Senior Role', type: 'PROMOTION', difficulty: 40 },
      { title: 'Team Lead', type: 'EXPANSION', difficulty: 55 },
      { title: 'Director', type: 'EXPANSION', difficulty: 70 },
    ];

    patterns.forEach((pattern, index) => {
      paths.push({
        id: `primary-${index}`,
        targetCareerId: `career-${pattern.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: pattern.title,
        description: `Natural advancement into ${pattern.title} role`,
        type: pattern.type,
        transitionDifficulty: pattern.difficulty,
        estimatedTransitionTime: this.estimateTransitionTime(pattern.difficulty),
        requiredSkills: this.deriveRequiredSkills(pattern.title, career),
        possessedSkills: this.derivePossessedSkills(career),
        skillGapPercent: Math.round(pattern.difficulty * 0.6),
        viability: Math.round(100 - pattern.difficulty * 0.5),
      });
    });

    return paths.slice(0, this.config.maxPathsPerCategory);
  }

  /**
   * Generates alternative career paths (lateral moves).
   *
   * @param career - Career intelligence
   * @returns Alternative paths
   */
  private generateAlternativePaths(career: CareerIntelligence): FuturePath[] {
    const paths: FuturePath[] = [];
    const metadata = career.metadata;
    const category = metadata.category.toUpperCase();
    const transferability = career.careerAdvantages.transferability?.score ?? 50;

    // Define alternative path patterns
    const alternativePatterns: Record<string, Array<{ title: string; difficulty: number }>> = {
      ENGINEERING: [
        { title: 'Product Manager', difficulty: 45 },
        { title: 'Solutions Architect', difficulty: 40 },
        { title: 'Technical Consultant', difficulty: 35 },
        { title: 'Developer Advocate', difficulty: 50 },
      ],
      PRODUCT: [
        { title: 'Product Marketing Manager', difficulty: 40 },
        { title: 'Strategy Consultant', difficulty: 50 },
        { title: 'Operations Manager', difficulty: 45 },
        { title: 'Business Analyst', difficulty: 35 },
      ],
      MARKETING: [
        { title: 'Product Marketing', difficulty: 40 },
        { title: 'Content Strategy', difficulty: 35 },
        { title: 'Growth Marketing', difficulty: 45 },
        { title: 'Brand Management', difficulty: 40 },
      ],
      SALES: [
        { title: 'Business Development', difficulty: 35 },
        { title: 'Customer Success', difficulty: 30 },
        { title: 'Account Management', difficulty: 30 },
        { title: 'Partnerships', difficulty: 45 },
      ],
      FINANCE: [
        { title: 'Strategy Consultant', difficulty: 50 },
        { title: 'Business Analyst', difficulty: 40 },
        { title: 'Operations Analyst', difficulty: 45 },
        { title: 'Risk Manager', difficulty: 40 },
      ],
      CONSULTING: [
        { title: 'Strategy Manager', difficulty: 40 },
        { title: 'Product Manager', difficulty: 45 },
        { title: 'Business Development', difficulty: 40 },
        { title: 'Operations Manager', difficulty: 45 },
      ],
      OPERATIONS: [
        { title: 'Program Manager', difficulty: 35 },
        { title: 'Product Manager', difficulty: 50 },
        { title: 'Strategy Consultant', difficulty: 50 },
        { title: 'General Manager', difficulty: 55 },
      ],
      RESEARCH: [
        { title: 'Data Scientist', difficulty: 45 },
        { title: 'Product Researcher', difficulty: 40 },
        { title: 'Strategy Analyst', difficulty: 50 },
        { title: 'Technical Consultant', difficulty: 45 },
      ],
    };

    const patterns = alternativePatterns[category] ?? [
      { title: 'Consultant', difficulty: 45 },
      { title: 'Analyst', difficulty: 40 },
      { title: 'Specialist', difficulty: 35 },
    ];

    patterns.forEach((pattern, index) => {
      // Adjust difficulty by transferability
      const adjustedDifficulty = Math.round(
        pattern.difficulty - (transferability - 50) * 0.3
      );

      paths.push({
        id: `alt-${index}`,
        targetCareerId: `career-${pattern.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: pattern.title,
        description: `Lateral move to ${pattern.title} leveraging transferable skills`,
        type: 'PIVOT',
        transitionDifficulty: Math.max(20, Math.min(adjustedDifficulty, 90)),
        estimatedTransitionTime: this.estimateTransitionTime(adjustedDifficulty),
        requiredSkills: this.deriveRequiredSkills(pattern.title, career),
        possessedSkills: this.derivePossessedSkills(career),
        skillGapPercent: Math.round(adjustedDifficulty * 0.7),
        viability: Math.round(100 - adjustedDifficulty * 0.6),
      });
    });

    return paths.slice(0, this.config.maxPathsPerCategory);
  }

  /**
   * Generates expansion paths (broader scope).
   *
   * @param career - Career intelligence
   * @returns Expansion paths
   */
  private generateExpansionPaths(career: CareerIntelligence): FuturePath[] {
    const paths: FuturePath[] = [];
    const metadata = career.metadata;
    const category = metadata.category.toUpperCase();

    // Define expansion patterns (broader scope, cross-functional)
    const expansionPatterns: Record<string, Array<{ title: string; difficulty: number }>> = {
      ENGINEERING: [
        { title: 'Engineering Director', difficulty: 65 },
        { title: 'VP of Engineering', difficulty: 75 },
        { title: 'CTO', difficulty: 85 },
        { title: 'Technical Founder', difficulty: 80 },
      ],
      PRODUCT: [
        { title: 'Head of Product', difficulty: 70 },
        { title: 'Chief Product Officer', difficulty: 80 },
        { title: 'GM of Business Unit', difficulty: 75 },
        { title: 'Product Founder', difficulty: 75 },
      ],
      MARKETING: [
        { title: 'Head of Marketing', difficulty: 70 },
        { title: 'Chief Marketing Officer', difficulty: 80 },
        { title: 'Brand Director', difficulty: 65 },
        { title: 'Marketing Consultant', difficulty: 55 },
      ],
      SALES: [
        { title: 'Head of Sales', difficulty: 65 },
        { title: 'Chief Revenue Officer', difficulty: 80 },
        { title: 'Business Unit Leader', difficulty: 75 },
        { title: 'Sales Consultant', difficulty: 50 },
      ],
      FINANCE: [
        { title: 'Head of Finance', difficulty: 70 },
        { title: 'Chief Financial Officer', difficulty: 85 },
        { title: 'Finance Director', difficulty: 65 },
        { title: 'Investment Partner', difficulty: 75 },
      ],
      CONSULTING: [
        { title: 'Practice Lead', difficulty: 65 },
        { title: 'Managing Director', difficulty: 75 },
        { title: 'Global Partner', difficulty: 80 },
        { title: 'Independent Consultant', difficulty: 50 },
      ],
      OPERATIONS: [
        { title: 'Head of Operations', difficulty: 70 },
        { title: 'Chief Operating Officer', difficulty: 85 },
        { title: 'General Manager', difficulty: 70 },
        { title: 'Operations Consultant', difficulty: 55 },
      ],
      RESEARCH: [
        { title: 'Research Director', difficulty: 70 },
        { title: 'Chief Scientist', difficulty: 80 },
        { title: 'Innovation Lead', difficulty: 65 },
        { title: 'Research Consultant', difficulty: 55 },
      ],
    };

    const patterns = expansionPatterns[category] ?? [
      { title: 'Director', difficulty: 70 },
      { title: 'VP', difficulty: 80 },
      { title: 'C-Suite', difficulty: 90 },
    ];

    patterns.forEach((pattern, index) => {
      paths.push({
        id: `expansion-${index}`,
        targetCareerId: `career-${pattern.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: pattern.title,
        description: `Expansion into broader ${pattern.title} role with wider scope`,
        type: 'EXPANSION',
        transitionDifficulty: pattern.difficulty,
        estimatedTransitionTime: this.estimateTransitionTime(pattern.difficulty) * 1.5,
        requiredSkills: this.deriveRequiredSkills(pattern.title, career),
        possessedSkills: this.derivePossessedSkills(career),
        skillGapPercent: Math.round(pattern.difficulty * 0.8),
        viability: Math.round(100 - pattern.difficulty * 0.7),
      });
    });

    return paths.slice(0, this.config.maxPathsPerCategory);
  }

  /**
   * Generates backup paths (fallback options).
   *
   * @param career - Career intelligence
   * @returns Backup paths
   */
  private generateBackupPaths(career: CareerIntelligence): FuturePath[] {
    const paths: FuturePath[] = [];
    const transferability = career.careerAdvantages.transferability?.score ?? 50;
    const metadata = career.metadata;

    // Backup options are always available regardless of category
    const backupOptions = [
      { title: 'Independent Consultant', difficulty: 50, type: 'ENTREPRENEURIAL' as const },
      { title: 'Freelance Specialist', difficulty: 40, type: 'ENTREPRENEURIAL' as const },
      { title: 'Industry Advisor', difficulty: 55, type: 'ENTREPRENEURIAL' as const },
      { title: 'Technical Recruiter', difficulty: 35, type: 'PIVOT' as const },
      { title: 'Corporate Trainer', difficulty: 40, type: 'PIVOT' as const },
    ];

    backupOptions.forEach((option, index) => {
      // Backup options become easier with higher transferability
      const adjustedDifficulty = Math.round(
        option.difficulty - (transferability - 50) * 0.4
      );

      paths.push({
        id: `backup-${index}`,
        targetCareerId: `career-${option.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: option.title,
        description: `Viable backup option using ${metadata.category} expertise`,
        type: option.type,
        transitionDifficulty: Math.max(15, Math.min(adjustedDifficulty, 85)),
        estimatedTransitionTime: this.estimateTransitionTime(adjustedDifficulty),
        requiredSkills: this.deriveRequiredSkills(option.title, career),
        possessedSkills: this.derivePossessedSkills(career),
        skillGapPercent: Math.round(adjustedDifficulty * 0.5),
        viability: Math.round(85 - adjustedDifficulty * 0.3),
      });
    });

    return paths.slice(0, this.config.maxPathsPerCategory);
  }

  /**
   * Calculates path diversity metrics.
   *
   * @param primary - Primary paths
   * @param alternative - Alternative paths
   * @param expansion - Expansion paths
   * @param backup - Backup paths
   * @param metadata - Career metadata
   * @returns Path diversity
   */
  private calculatePathDiversity(
    primary: FuturePath[],
    alternative: FuturePath[],
    expansion: FuturePath[],
    backup: FuturePath[],
    metadata: CareerIntelligence['metadata']
  ): PathDiversity {
    const allPaths = [...primary, ...alternative, ...expansion, ...backup];

    // Estimate industry diversity
    const industryCount = this.estimateIndustryCount(metadata, allPaths.length);
    const industryDiversity = Math.min(industryCount * 15, 100);

    // Function diversity based on path types
    const functionTypes = new Set(allPaths.map((p) => p.type)).size;
    const functionDiversity = Math.min(functionTypes * 20, 100);

    // Seniority diversity
    const seniorityLevels = new Set(
      allPaths.map((p) => this.inferSeniorityLevel(p.title))
    ).size;
    const seniorityDiversity = Math.min(seniorityLevels * 25, 100);

    // Geographic diversity (estimated)
    const geographicDiversity = 60; // Base assumption of moderate geographic options

    // Overall diversity
    const overall = Math.round(
      industryDiversity * 0.25 +
      functionDiversity * 0.35 +
      seniorityDiversity * 0.25 +
      geographicDiversity * 0.15
    );

    return {
      industryDiversity,
      functionDiversity,
      seniorityDiversity,
      geographicDiversity,
      overall,
    };
  }

  /**
   * Estimates transition time in months.
   *
   * @param difficulty - Transition difficulty
   * @returns Estimated months
   */
  private estimateTransitionTime(difficulty: number): number {
    // Base time 3 months, scales with difficulty
    return Math.round(3 + difficulty * 0.15);
  }

  /**
   * Derives required skills for a path.
   *
   * @param title - Path title
   * @param career - Career intelligence
   * @returns Required skills
   */
  private deriveRequiredSkills(
    title: string,
    career: CareerIntelligence
  ): string[] {
    const baseSkills = [
      'Domain expertise',
      'Communication',
      'Problem solving',
    ];

    // Add role-specific skills
    const upperTitle = title.toUpperCase();

    if (upperTitle.includes('MANAGER') || upperTitle.includes('DIRECTOR')) {
      baseSkills.push('Leadership', 'Team management', 'Strategic thinking');
    }

    if (upperTitle.includes('CONSULTANT') || upperTitle.includes('ADVISOR')) {
      baseSkills.push('Client management', 'Business acumen', 'Presentation');
    }

    if (upperTitle.includes('FOUNDER') || upperTitle.includes('ENTREPRENEUR')) {
      baseSkills.push('Business development', 'Fundraising', 'Risk management');
    }

    if (upperTitle.includes('SPECIALIST') || upperTitle.includes('STAFF')) {
      baseSkills.push('Deep expertise', 'Technical excellence', 'Innovation');
    }

    return baseSkills.slice(0, 5);
  }

  /**
   * Derives possessed skills from career.
   *
   * @param career - Career intelligence
   * @returns Possessed skills
   */
  private derivePossessedSkills(career: CareerIntelligence): string[] {
    const skills: string[] = ['Core domain skills'];

    const cognitiveDemands = career.cognitiveDemands;
    if (cognitiveDemands.analyticalDemand?.score ?? 0 > 50) {
      skills.push('Analytical thinking');
    }
    if (cognitiveDemands.creativeDemand?.score ?? 0 > 50) {
      skills.push('Creative problem solving');
    }
    if (cognitiveDemands.verbalDemand?.score ?? 0 > 50) {
      skills.push('Communication');
    }

    const workEnvironment = career.workEnvironment;
    if (workEnvironment.peopleIntensity?.score ?? 0 > 50) {
      skills.push('Interpersonal skills');
    }
    if (workEnvironment.leadershipOpportunity?.score ?? 0 > 50) {
      skills.push('Leadership potential');
    }

    return skills.slice(0, 4);
  }

  /**
   * Estimates industry count accessible.
   *
   * @param metadata - Career metadata
   * @param pathCount - Number of paths
   * @returns Estimated industry count
   */
  private estimateIndustryCount(
    metadata: CareerIntelligence['metadata'],
    pathCount: number
  ): number {
    const baseCount = 3;
    const transferableBoost = pathCount > 10 ? 2 : 1;

    // Some categories are more industry-specific
    const restrictedCategories = ['HEALTHCARE', 'LEGAL', 'GOVERNMENT'];
    const isRestricted = restrictedCategories.some((rc) =>
      metadata.category.toUpperCase().includes(rc)
    );

    return isRestricted ? baseCount : baseCount + transferableBoost + 1;
  }

  /**
   * Infers seniority level from title.
   *
   * @param title - Job title
   * @returns Seniority level
   */
  private inferSeniorityLevel(title: string): string {
    const upperTitle = title.toUpperCase();

    if (upperTitle.includes('CFO') || upperTitle.includes('CEO') || upperTitle.includes('CTO') || upperTitle.includes('CMO') || upperTitle.includes('CHIEF') || upperTitle.includes('PARTNER')) {
      return 'EXECUTIVE';
    }

    if (upperTitle.includes('VP') || upperTitle.includes('DIRECTOR') || upperTitle.includes('HEAD')) {
      return 'SENIOR';
    }

    if (upperTitle.includes('MANAGER') || upperTitle.includes('LEAD')) {
      return 'MID';
    }

    if (upperTitle.includes('SENIOR') || upperTitle.includes('STAFF') || upperTitle.includes('PRINCIPAL')) {
      return 'SENIOR_INDIVIDUAL';
    }

    return 'INDIVIDUAL';
  }
}

/**
 * Creates a default future options engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured FutureOptionsEngine
 */
export function createFutureOptionsEngine(
  config?: Partial<OptionalityIntelligenceConfig>
): FutureOptionsEngine {
  const fullConfig: OptionalityIntelligenceConfig = {
    ...import('./optionality-types').DEFAULT_OPTIONALITY_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new FutureOptionsEngine(fullConfig);
}
