/**
 * Career Path Intelligence - Path Validation Engine
 *
 * Validates career paths for feasibility, realism, and compatibility
 * with student constraints and context.
 *
 * Validation dimensions:
 * - Feasibility: Can the student actually complete this path?
 * - Constraint compatibility: Does it fit financial/time/location constraints?
 * - Prerequisite satisfaction: Does the student have required background?
 * - Resource availability: Are required resources accessible?
 * - Context compatibility: Does it fit family/cultural context?
 *
 * @module intelligence/career-path-intelligence
 */

import {
  CareerPath,
  CareerPathIntelligenceInput,
  PathValidationResult,
  PathIntelligenceStudentProfile,
  Milestone,
} from '../types';

/**
 * Path Validation Engine Configuration
 */
export interface PathValidationEngineConfig {
  /** Strict validation mode - reject paths with any issues */
  strictMode: boolean;
  /** Validate prerequisites */
  validatePrerequisites: boolean;
  /** Validate financial constraints */
  validateFinancial: boolean;
  /** Validate time constraints */
  validateTime: boolean;
  /** Validate location constraints */
  validateLocation: boolean;
  /** Minimum validation score to pass (0-1) */
  minimumScore: number;
}

/**
 * Default configuration
 */
export const DEFAULT_PATH_VALIDATION_CONFIG: PathValidationEngineConfig = {
  strictMode: false,
  validatePrerequisites: true,
  validateFinancial: true,
  validateTime: true,
  validateLocation: true,
  minimumScore: 0.5,
};

/**
 * Validation issue
 */
interface ValidationIssue {
  type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  milestoneId?: string;
}

/**
 * Path Validation Engine
 */
export class PathValidationEngine {
  private config: PathValidationEngineConfig;

  constructor(config: Partial<PathValidationEngineConfig> = {}) {
    this.config = { ...DEFAULT_PATH_VALIDATION_CONFIG, ...config };
  }

  /**
   * Validate a single path
   */
  validate(
    path: CareerPath,
    input: CareerPathIntelligenceInput
  ): PathValidationResult[] {
    const results: PathValidationResult[] = [];

    // Feasibility validation
    if (this.config.validatePrerequisites) {
      results.push(this.validatePrerequisites(path, input.studentProfile));
    }

    // Financial validation
    if (this.config.validateFinancial) {
      results.push(this.validateFinancialConstraints(path, input.studentProfile));
    }

    // Time validation
    if (this.config.validateTime) {
      results.push(this.validateTimeConstraints(path, input.studentProfile));
    }

    // Location validation
    if (this.config.validateLocation) {
      results.push(this.validateLocationConstraints(path, input.studentProfile));
    }

    // Context validation
    results.push(this.validateContextCompatibility(path, input.studentProfile));

    // Resource validation
    results.push(this.validateResourceAvailability(path, input.studentProfile));

    return results;
  }

  /**
   * Validate multiple paths
   */
  validateMultiple(
    paths: CareerPath[],
    input: CareerPathIntelligenceInput
  ): { validPaths: CareerPath[]; invalidPaths: { path: CareerPath; results: PathValidationResult[] }[] } {
    const validPaths: CareerPath[] = [];
    const invalidPaths: { path: CareerPath; results: PathValidationResult[] }[] = [];

    for (const path of paths) {
      const results = this.validate(path, input);
      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
      const hasCriticalIssues = results.some(r => 
        r.issues.some(i => i.includes('CRITICAL') || i.includes('BLOCKING'))
      );

      path.validationResults = results;

      if (averageScore >= this.config.minimumScore && !hasCriticalIssues) {
        path.isValidated = true;
        validPaths.push(path);
      } else {
        path.isValidated = false;
        invalidPaths.push({ path, results });
      }
    }

    return { validPaths, invalidPaths };
  }

  /**
   * Validate prerequisites
   */
  private validatePrerequisites(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): PathValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1;

    for (const milestone of path.milestones) {
      for (const prereq of milestone.prerequisites) {
        const satisfied = this.checkPrerequisiteSatisfaction(prereq, profile);
        
        if (!satisfied && prereq.required) {
          issues.push(`Missing required prerequisite for "${milestone.name}": ${prereq.description}`);
          score -= 0.15;
          
          if (prereq.alternativeSatisfiers && prereq.alternativeSatisfiers.length > 0) {
            recommendations.push(
              `For "${milestone.name}", consider: ${prereq.alternativeSatisfiers.join(', ')}`
            );
          }
        } else if (!satisfied && !prereq.required) {
          recommendations.push(
            `Optional prerequisite for "${milestone.name}" not met: ${prereq.description}`
          );
        }
      }
    }

    return {
      validator: 'PREREQUISITE',
      passed: score >= 0.5,
      score: Math.max(score, 0),
      issues,
      recommendations,
    };
  }

  /**
   * Check if a prerequisite is satisfied
   */
  private checkPrerequisiteSatisfaction(
    prereq: Milestone['prerequisites'][0],
    profile: PathIntelligenceStudentProfile
  ): boolean {
    switch (prereq.type) {
      case 'SKILL':
        // Check if student has the skill
        const skillKeywords = prereq.description.toLowerCase().split(' ');
        return profile.skills.some(skill => 
          skillKeywords.some(keyword => skill.toLowerCase().includes(keyword))
        );

      case 'CREDENTIAL':
        // Check if student has the credential
        return profile.credentials.some(cred => 
          prereq.description.toLowerCase().includes(cred.toLowerCase()) ||
          cred.toLowerCase().includes(prereq.description.toLowerCase().split(' ')[0])
        );

      case 'EXPERIENCE':
        // Check if student has sufficient experience
        const yearsMatch = prereq.description.match(/(\d+)\s*year/);
        const requiredYears = yearsMatch ? parseInt(yearsMatch[1]) : 0;
        return profile.yearsOfExperience >= requiredYears;

      case 'RESOURCE':
        // Resources are checked separately
        return true;

      case 'MILESTONE':
        // Milestone prerequisites are path-internal
        return true;

      default:
        return true;
    }
  }

  /**
   * Validate financial constraints
   */
  private validateFinancialConstraints(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): PathValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1;

    const maxInvestment = profile.financialConstraints.maxInvestment;
    const totalCost = path.totalCost;

    // Check total cost
    if (totalCost > maxInvestment) {
      const shortfall = totalCost - maxInvestment;
      issues.push(
        `Path cost (${this.formatCurrency(totalCost)}) exceeds budget (${this.formatCurrency(maxInvestment)}) by ${this.formatCurrency(shortfall)}`
      );
      score -= 0.4;

      if (profile.financialConstraints.canTakeLoan) {
        recommendations.push('Consider education loan to cover the gap');
      } else {
        recommendations.push('Look for scholarships or choose a lower-cost alternative');
      }
    }

    // Check monthly budget
    const avgMonthlyCost = totalCost / path.duration;
    if (avgMonthlyCost > profile.financialConstraints.monthlyBudget) {
      issues.push(
        `Average monthly cost (${this.formatCurrency(avgMonthlyCost)}) exceeds monthly budget (${this.formatCurrency(profile.financialConstraints.monthlyBudget)})`
      );
      score -= 0.2;
      recommendations.push('Look for part-time work or assistantship opportunities');
    }

    // Check ROI
    if (path.roi < 0.1) {
      issues.push(`Low ROI (${(path.roi * 100).toFixed(1)}%) - may not justify investment`);
      score -= 0.15;
      recommendations.push('Consider paths with better salary prospects or lower cost');
    }

    return {
      validator: 'CONSTRAINT',
      passed: score >= 0.5,
      score: Math.max(score, 0),
      issues,
      recommendations,
    };
  }

  /**
   * Validate time constraints
   */
  private validateTimeConstraints(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): PathValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1;

    const maxDuration = profile.timeConstraints.maxDuration;

    // Check total duration
    if (path.duration > maxDuration) {
      const excess = path.duration - maxDuration;
      issues.push(
        `Path duration (${path.duration} months) exceeds maximum (${maxDuration} months) by ${excess} months`
      );
      score -= 0.4;
      recommendations.push('Consider accelerated programs or alternative entry points');
    }

    // Check hours per week
    const avgWeeklyHours = this.estimateWeeklyHours(path);
    if (avgWeeklyHours > profile.timeConstraints.hoursPerWeek) {
      issues.push(
        `Path requires ~${avgWeeklyHours} hours/week, but you only have ${profile.timeConstraints.hoursPerWeek} hours available`
      );
      score -= 0.25;
      recommendations.push('Consider part-time or online options to reduce weekly commitment');
    }

    // Age considerations for exam-based paths
    const hasExamMilestones = path.milestones.some(m => 
      m.name.toLowerCase().includes('jee') ||
      m.name.toLowerCase().includes('neet') ||
      m.name.toLowerCase().includes('upsc')
    );

    if (hasExamMilestones) {
      recommendations.push('Ensure you meet age and attempt limits for competitive exams');
    }

    return {
      validator: 'CONSTRAINT',
      passed: score >= 0.5,
      score: Math.max(score, 0),
      issues,
      recommendations,
    };
  }

  /**
   * Validate location constraints
   */
  private validateLocationConstraints(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): PathValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1;

    // Check if path requires relocation
    const requiresRelocation = this.pathRequiresRelocation(path);

    if (requiresRelocation && !profile.timeConstraints.canRelocate) {
      issues.push('Path requires relocation, but you cannot relocate');
      score -= 0.5;
      recommendations.push('Look for remote or local alternatives to this path');
    }

    // Check preferred locations
    if (profile.locationConstraints.preferredLocations.length > 0) {
      const pathLocations = this.getPathLocations(path);
      const hasPreferredLocation = pathLocations.some(loc =>
        profile.locationConstraints.preferredLocations.some(pref =>
          loc.toLowerCase().includes(pref.toLowerCase())
        )
      );

      if (!hasPreferredLocation && pathLocations.length > 0) {
        recommendations.push(
          `Path locations (${pathLocations.join(', ')}) don't match your preferences (${profile.locationConstraints.preferredLocations.join(', ')})`
        );
      }
    }

    // Check forbidden locations
    const pathLocations = this.getPathLocations(path);
    const hasForbiddenLocation = pathLocations.some(loc =>
      profile.locationConstraints.forbiddenLocations.some(forbidden =>
        loc.toLowerCase().includes(forbidden.toLowerCase())
      )
    );

    if (hasForbiddenLocation) {
      issues.push('Path includes locations you have marked as unacceptable');
      score -= 0.3;
    }

    // Remote work compatibility
    if (profile.locationConstraints.remotePreference === 'ONLY') {
      const isRemoteCompatible = this.isPathRemoteCompatible(path);
      if (!isRemoteCompatible) {
        issues.push('Path is not compatible with remote-only preference');
        score -= 0.3;
      }
    }

    return {
      validator: 'CONSTRAINT',
      passed: score >= 0.5,
      score: Math.max(score, 0),
      issues,
      recommendations,
    };
  }

  /**
   * Validate context compatibility
   */
  private validateContextCompatibility(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): PathValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1;

    // Family context
    if (profile.familyContext) {
      // Check for family pressure compatibility
      const hasEntrepreneurialMilestone = path.milestones.some(m =>
        m.name.toLowerCase().includes('startup') ||
        m.name.toLowerCase().includes('venture')
      );

      if (hasEntrepreneurialMilestone && 
          profile.familyContext.pressureSources.includes('STABILITY')) {
        issues.push('Entrepreneurial path may conflict with family expectations for stability');
        score -= 0.15;
        recommendations.push('Discuss entrepreneurial intentions with family; have backup plan ready');
      }

      // Check for dependents
      if (profile.familyContext.dependents > 0) {
        const riskyMilestones = path.milestones.filter(m => m.failureProbability > 0.5);
        if (riskyMilestones.length > 0) {
          issues.push(
            `Path has ${riskyMilestones.length} high-risk milestones which may be challenging with family dependents`
          );
          score -= 0.1;
          recommendations.push('Ensure financial safety net before attempting high-risk milestones');
        }
      }
    }

    // Risk tolerance alignment
    const pathRiskScore = this.getPathRiskLevel(path);
    if (pathRiskScore > 0.7 && profile.riskTolerance === 'LOW') {
      issues.push('Path risk level exceeds your risk tolerance');
      score -= 0.2;
      recommendations.push('Consider safer alternatives or add more backup plans');
    }

    return {
      validator: 'CONTEXT',
      passed: score >= 0.5,
      score: Math.max(score, 0),
      issues,
      recommendations,
    };
  }

  /**
   * Validate resource availability
   */
  private validateResourceAvailability(
    path: CareerPath,
    profile: PathIntelligenceStudentProfile
  ): PathValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1;

    // Check each milestone's resources
    for (const milestone of path.milestones) {
      for (const resource of milestone.resources) {
        if (!resource.flexible) {
          const available = this.checkResourceAvailability(resource, profile);
          if (!available) {
            issues.push(
              `Required resource unavailable for "${milestone.name}": ${resource.description}`
            );
            score -= 0.1;
            recommendations.push(`Source ${resource.description} before starting "${milestone.name}"`);
          }
        }
      }
    }

    return {
      validator: 'RESOURCE',
      passed: score >= 0.5,
      score: Math.max(score, 0),
      issues,
      recommendations,
    };
  }

  /**
   * Check if a resource is available
   */
  private checkResourceAvailability(
    resource: Milestone['resources'][0],
    profile: PathIntelligenceStudentProfile
  ): boolean {
    switch (resource.type) {
      case 'MONEY':
        return profile.financialConstraints.maxInvestment >= (resource.amount || 0);
      
      case 'TIME':
        // Time is generally available, checked in time validation
        return true;
      
      case 'MENTOR':
      case 'NETWORK':
      case 'TOOL':
      case 'ACCESS':
        // Assume available unless specified otherwise
        return true;
      
      default:
        return true;
    }
  }

  /**
   * Estimate weekly hours required for a path
   */
  private estimateWeeklyHours(path: CareerPath): number {
    let totalHours = 0;

    for (const milestone of path.milestones) {
      const timeResource = milestone.resources.find(r => r.type === 'TIME');
      if (timeResource && timeResource.amount) {
        totalHours += timeResource.amount;
      } else {
        // Default estimate
        totalHours += 40;
      }
    }

    return Math.round(totalHours / path.milestones.length);
  }

  /**
   * Check if path requires relocation
   */
  private pathRequiresRelocation(path: CareerPath): boolean {
    // Check for location-specific milestones
    const locationKeywords = ['iit', 'iim', 'relocation', 'move', 'abroad', 'onsite'];
    return path.milestones.some(m =>
      locationKeywords.some(keyword => m.name.toLowerCase().includes(keyword))
    );
  }

  /**
   * Get locations mentioned in path
   */
  private getPathLocations(path: CareerPath): string[] {
    const locations: string[] = [];
    
    // Extract locations from milestone names
    const locationPatterns = [
      'IIT', 'IIM', 'NIT', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 
      'Pune', 'Chennai', 'Kolkata', 'Abroad', 'US', 'UK'
    ];

    for (const milestone of path.milestones) {
      for (const pattern of locationPatterns) {
        if (milestone.name.includes(pattern)) {
          locations.push(pattern);
        }
      }
    }

    return [...new Set(locations)];
  }

  /**
   * Check if path is remote-compatible
   */
  private isPathRemoteCompatible(path: CareerPath): boolean {
    // Paths with in-person requirements
    const inPersonKeywords = ['iit', 'iim', 'college', 'campus', 'relocation', 'onsite'];
    return !path.milestones.some(m =>
      inPersonKeywords.some(keyword => m.name.toLowerCase().includes(keyword))
    );
  }

  /**
   * Get overall path risk level
   */
  private getPathRiskLevel(path: CareerPath): number {
    const riskScores: Record<string, number> = {
      'VERY_LOW': 0.1,
      'LOW': 0.25,
      'MODERATE': 0.5,
      'HIGH': 0.75,
      'VERY_HIGH': 0.9,
    };
    return riskScores[path.riskLevel] || 0.5;
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PathValidationEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function
 */
export function createPathValidationEngine(
  config?: Partial<PathValidationEngineConfig>
): PathValidationEngine {
  return new PathValidationEngine(config);
}
