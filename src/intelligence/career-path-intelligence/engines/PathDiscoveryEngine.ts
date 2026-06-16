/**
 * Career Path Intelligence - Path Discovery Engine
 *
 * Generates multiple pathways to reach a target career.
 * Discovers direct, indirect, and non-traditional paths.
 *
 * Examples:
 * Target: Product Manager
 * - Path A: IIT → Software Engineer → Product Manager (Direct)
 * - Path B: Tier 2 College → Business Analyst → Associate PM (Indirect)
 * - Path C: Startup → Product Operations → Product Manager (Non-traditional)
 *
 * @module intelligence/career-path-intelligence
 */

import {
  CareerPath,
  CareerPathIntelligenceInput,
  PathDiscoveryResult,
  PathType,
  PathDifficulty,
  PathRisk,
  Milestone,
  MilestoneStatus,
  PathId,
  PathTemplate,
  MilestoneTemplate,
} from '../types';

/**
 * Path Discovery Engine Configuration
 */
export interface PathDiscoveryEngineConfig {
  /** Maximum number of paths to discover */
  maxPaths: number;
  /** Minimum confidence threshold for paths */
  minConfidence: number;
  /** Include non-traditional paths */
  includeNonTraditional: boolean;
  /** Include entrepreneurial paths */
  includeEntrepreneurial: boolean;
  /** Include India-specific exam paths */
  includeIndiaPaths: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_PATH_DISCOVERY_CONFIG: PathDiscoveryEngineConfig = {
  maxPaths: 10,
  minConfidence: 0.3,
  includeNonTraditional: true,
  includeEntrepreneurial: true,
  includeIndiaPaths: true,
};

/**
 * Career database entry
 */
interface CareerEntry {
  name: string;
  alternativeTitles: string[];
  typicalPaths: PathTemplate[];
  entryLevelRoles: string[];
  midLevelRoles: string[];
  seniorLevelRoles: string[];
  industries: string[];
  averageStartingSalary: number;
  averageSalary5Years: number;
}

/**
 * Path Discovery Engine
 */
export class PathDiscoveryEngine {
  private config: PathDiscoveryEngineConfig;
  private careerDatabase: Map<string, CareerEntry>;

  constructor(config: Partial<PathDiscoveryEngineConfig> = {}) {
    this.config = { ...DEFAULT_PATH_DISCOVERY_CONFIG, ...config };
    this.careerDatabase = this.initializeCareerDatabase();
  }

  /**
   * Discover paths to a target career
   */
  discover(
    input: CareerPathIntelligenceInput
  ): PathDiscoveryResult {
    const targetCareer = input.targetCareer;
    const careerEntry = this.careerDatabase.get(targetCareer.toLowerCase());

    if (!careerEntry) {
      // Generate generic paths based on target
      return this.generateGenericPaths(targetCareer, input);
    }

    // Generate paths from templates
    const paths: CareerPath[] = [];

    for (const template of careerEntry.typicalPaths) {
      const path = this.buildPathFromTemplate(
        template,
        targetCareer,
        careerEntry,
        input
      );

      if (path.confidence >= this.config.minConfidence) {
        paths.push(path);
      }
    }

    // Generate additional paths based on student profile
    const additionalPaths = this.generateProfileSpecificPaths(
      targetCareer,
      careerEntry,
      input
    );

    paths.push(...additionalPaths);

    // Sort by confidence and limit
    paths.sort((a, b) => b.confidence - a.confidence);
    const limitedPaths = paths.slice(0, this.config.maxPaths);

    // Link alternative paths
    this.linkAlternativePaths(limitedPaths);

    return {
      targetCareer,
      paths: limitedPaths,
      discoveryMethod: careerEntry ? 'DATABASE' : 'GENERATED',
      coverage: this.calculateCoverage(limitedPaths),
    };
  }

  /**
   * Build a complete path from a template
   */
  private buildPathFromTemplate(
    template: PathTemplate,
    targetCareer: string,
    careerEntry: CareerEntry,
    input: CareerPathIntelligenceInput
  ): CareerPath {
    const pathId = this.generatePathId(targetCareer, template.name);

    // Build milestones
    const milestones: Milestone[] = [];
    let totalDuration = 0;
    let totalCost = 0;

    for (let i = 0; i < template.milestones.length; i++) {
      const milestoneTemplate = template.milestones[i];
      const milestone = this.buildMilestone(
        milestoneTemplate,
        i + 1,
        input
      );
      milestones.push(milestone);
      totalDuration += milestone.expectedDuration;
      totalCost += this.estimateMilestoneCost(milestone);
    }

    // Calculate confidence based on profile fit
    const confidence = this.calculatePathConfidence(template, input);

    // Calculate optionality
    const optionalityScore = this.calculateOptionalityScore(template, milestones);

    return {
      pathId,
      name: `${template.name} Path to ${targetCareer}`,
      description: this.generatePathDescription(template, milestones),
      type: template.type,
      targetCareer,
      alternativeTitles: careerEntry.alternativeTitles,
      industry: careerEntry.industries[0],
      difficulty: template.difficulty,
      duration: totalDuration,
      confidence,
      riskLevel: template.risk,
      totalCost,
      opportunityCost: this.calculateOpportunityCost(totalDuration, input),
      expectedStartingSalary: careerEntry.averageStartingSalary,
      expectedSalaryAt5Years: careerEntry.averageSalary5Years,
      roi: this.calculateROI(totalCost, careerEntry.averageStartingSalary, totalDuration),
      milestones,
      currentMilestoneIndex: 0,
      alternativePathIds: [],
      recoveryPathIds: [],
      transitionPathIds: [],
      optionalityScore,
      optionalityBreakdown: this.calculateOptionalityBreakdown(milestones),
      isValidated: false,
      validationResults: [],
      source: 'PATH_DISCOVERY_ENGINE',
      version: '2.0.0',
      updatedAt: Date.now(),
      progress: {
        status: 'PLANNED',
        milestonesCompleted: 0,
        milestonesFailed: 0,
        completionPercentage: 0,
      },
    };
  }

  /**
   * Build a milestone from template
   */
  private buildMilestone(
    template: MilestoneTemplate,
    order: number,
    input: CareerPathIntelligenceInput
  ): Milestone {
    return {
      id: `milestone_${order}_${Date.now()}`,
      name: template.name,
      description: template.description,
      order,
      expectedDuration: template.duration,
      minDuration: Math.max(1, Math.floor(template.duration * 0.7)),
      maxDuration: Math.ceil(template.duration * 1.5),
      prerequisites: this.inferPrerequisites(template),
      resources: this.inferResources(template, input),
      expectedOutcomes: this.inferOutcomes(template),
      skillsAcquired: template.skills,
      credentialsEarned: template.credentials || [],
      validationCriteria: this.inferValidationCriteria(template),
      successMetrics: this.inferSuccessMetrics(template),
      failureProbability: this.estimateFailureProbability(template, input),
      recoveryPaths: [],
      status: MilestoneStatus.NOT_STARTED,
    };
  }

  /**
   * Infer prerequisites for a milestone
   */
  private inferPrerequisites(template: MilestoneTemplate) {
    const prerequisites = [];

    // Basic education prerequisite
    if (template.name.toLowerCase().includes('college') ||
        template.name.toLowerCase().includes('degree')) {
      prerequisites.push({
        type: 'CREDENTIAL' as const,
        description: 'High School Diploma or equivalent',
        required: true,
      });
    }

    // Exam prerequisites
    if (template.name.toLowerCase().includes('jee')) {
      prerequisites.push({
        type: 'CREDENTIAL' as const,
        description: 'JEE Main qualification',
        required: true,
      });
    }

    if (template.name.toLowerCase().includes('neet')) {
      prerequisites.push({
        type: 'CREDENTIAL' as const,
        description: 'NEET qualification',
        required: true,
      });
    }

    return prerequisites;
  }

  /**
   * Infer resources needed
   */
  private inferResources(
    template: MilestoneTemplate,
    input: CareerPathIntelligenceInput
  ) {
    const resources = [];

    // Time resource
    resources.push({
      type: 'TIME' as const,
      description: 'Dedicated study/work time',
      amount: 40,
      unit: 'hours per week',
      flexible: false,
    });

    // Money resource
    if (template.name.toLowerCase().includes('college')) {
      resources.push({
        type: 'MONEY' as const,
        description: 'Tuition and fees',
        amount: 500000,
        unit: 'INR',
        flexible: true,
      });
    }

    return resources;
  }

  /**
   * Infer expected outcomes
   */
  private inferOutcomes(template: MilestoneTemplate) {
    const outcomes = [];

    // Skill outcomes
    if (template.skills.length > 0) {
      outcomes.push({
        type: 'SKILL' as const,
        description: `Proficiency in ${template.skills.join(', ')}`,
        confidence: 0.8,
      });
    }

    // Credential outcomes
    if (template.credentials && template.credentials.length > 0) {
      outcomes.push({
        type: 'CREDENTIAL' as const,
        description: template.credentials.join(', '),
        confidence: 0.9,
      });
    }

    return outcomes;
  }

  /**
   * Infer validation criteria
   */
  private inferValidationCriteria(template: MilestoneTemplate) {
    const criteria = [];

    if (template.name.toLowerCase().includes('exam')) {
      criteria.push({
        type: 'EXAM' as const,
        description: `Pass ${template.name}`,
        passingThreshold: 'Qualifying score',
      });
    } else if (template.name.toLowerCase().includes('degree')) {
      criteria.push({
        type: 'CERTIFICATION' as const,
        description: `Earn ${template.name}`,
        passingThreshold: 'Minimum passing grade',
      });
    } else {
      criteria.push({
        type: 'TIME' as const,
        description: `Complete ${template.duration} months`,
        passingThreshold: 'Full duration completed',
      });
    }

    return criteria;
  }

  /**
   * Infer success metrics
   */
  private inferSuccessMetrics(template: MilestoneTemplate) {
    const metrics = [];

    metrics.push({
      name: 'Completion',
      target: '100%',
      measurement: 'Milestone completed',
    });

    if (template.skills.length > 0) {
      metrics.push({
        name: 'Skill Acquisition',
        target: template.skills.length,
        measurement: 'Skills gained',
      });
    }

    return metrics;
  }

  /**
   * Estimate milestone cost
   */
  private estimateMilestoneCost(milestone: Milestone): number {
    let cost = 0;

    for (const resource of milestone.resources) {
      if (resource.type === 'MONEY' && resource.amount) {
        cost += resource.amount;
      }
    }

    return cost;
  }

  /**
   * Calculate path confidence based on profile fit
   */
  private calculatePathConfidence(
    template: PathTemplate,
    input: CareerPathIntelligenceInput
  ): number {
    let confidence = 0.5;

    // Adjust for risk tolerance match
    if (template.risk === PathRisk.LOW && input.studentProfile.riskTolerance === 'LOW') {
      confidence += 0.15;
    } else if (template.risk === PathRisk.HIGH && input.studentProfile.riskTolerance === 'HIGH') {
      confidence += 0.1;
    }

    // Adjust for path type preference
    if (input.studentProfile.preferredPathTypes.includes(template.type)) {
      confidence += 0.15;
    }

    // Adjust for resources
    const totalCost = template.milestones.reduce(
      (sum, m) => sum + this.estimateTemplateCost(m),
      0
    );
    if (totalCost <= input.studentProfile.financialConstraints.maxInvestment) {
      confidence += 0.1;
    }

    // Adjust for time
    const totalDuration = template.milestones.reduce((sum, m) => sum + m.duration, 0);
    if (totalDuration <= input.studentProfile.timeConstraints.maxDuration) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Estimate template milestone cost
   */
  private estimateTemplateCost(template: MilestoneTemplate): number {
    if (template.name.toLowerCase().includes('iit')) return 1000000;
    if (template.name.toLowerCase().includes('college')) return 800000;
    if (template.name.toLowerCase().includes('startup')) return 200000;
    return 100000;
  }

  /**
   * Calculate optionality score
   */
  private calculateOptionalityScore(
    template: PathTemplate,
    milestones: Milestone[]
  ): number {
    let score = 0.5;

    // More skills = more optionality
    const totalSkills = milestones.reduce((sum, m) => sum + m.skillsAcquired.length, 0);
    score += Math.min(totalSkills / 20, 0.2);

    // Non-traditional paths have higher optionality
    if (template.type === PathType.NON_TRADITIONAL || template.type === PathType.ENTREPRENEURIAL) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate optionality breakdown
   */
  private calculateOptionalityBreakdown(milestones: Milestone[]) {
    const allSkills = milestones.flatMap(m => m.skillsAcquired);
    const uniqueSkills = [...new Set(allSkills)];

    return {
      SKILL_TRANSFERABILITY: Math.min(uniqueSkills.length / 15, 1),
      NETWORK_BREADTH: 0.5,
      CREDENTIAL_VERSATILITY: 0.5,
      INDUSTRY_MOBILITY: 0.5,
      ROLE_FLEXIBILITY: 0.5,
      GEOGRAPHIC_MOBILITY: 0.5,
    };
  }

  /**
   * Calculate opportunity cost
   */
  private calculateOpportunityCost(
    duration: number,
    input: CareerPathIntelligenceInput
  ): number {
    // Assume average income of 50000 per month
    const monthlyIncome = 50000;
    return duration * monthlyIncome;
  }

  /**
   * Calculate ROI
   */
  private calculateROI(
    totalCost: number,
    startingSalary: number,
    duration: number
  ): number {
    const opportunityCost = duration * 50000;
    const totalInvestment = totalCost + opportunityCost;
    return startingSalary / totalInvestment;
  }

  /**
   * Generate path description
   */
  private generatePathDescription(
    template: PathTemplate,
    milestones: Milestone[]
  ): string {
    const duration = milestones.reduce((sum, m) => sum + m.expectedDuration, 0);
    const milestoneNames = milestones.map(m => m.name).join(' → ');

    return `${template.type} path taking ${duration} months through: ${milestoneNames}`;
  }

  /**
   * Generate profile-specific paths
   */
  private generateProfileSpecificPaths(
    targetCareer: string,
    careerEntry: CareerEntry,
    input: CareerPathIntelligenceInput
  ): CareerPath[] {
    const paths: CareerPath[] = [];

    // Generate India-specific paths if enabled
    if (this.config.includeIndiaPaths) {
      const indiaPaths = this.generateIndiaPaths(targetCareer, input);
      paths.push(...indiaPaths);
    }

    // Generate entrepreneurial path if enabled
    if (this.config.includeEntrepreneurial &&
        input.studentProfile.preferredPathTypes.includes(PathType.ENTREPRENEURIAL)) {
      const entrepreneurialPath = this.generateEntrepreneurialPath(targetCareer, input);
      if (entrepreneurialPath) paths.push(entrepreneurialPath);
    }

    return paths;
  }

  /**
   * Generate India-specific paths
   */
  private generateIndiaPaths(
    targetCareer: string,
    input: CareerPathIntelligenceInput
  ): CareerPath[] {
    const paths: CareerPath[] = [];

    // JEE → IIT → Engineering → Target
    if (targetCareer.toLowerCase().includes('engineer') ||
        targetCareer.toLowerCase().includes('product') ||
        targetCareer.toLowerCase().includes('software')) {
      const template: PathTemplate = {
        name: 'IIT Route',
        type: PathType.DIRECT,
        milestones: [
          {
            name: 'JEE Preparation',
            description: 'Prepare for JEE Main and Advanced',
            duration: 12,
            skills: ['Problem Solving', 'Physics', 'Chemistry', 'Mathematics'],
          },
          {
            name: 'IIT Admission',
            description: 'Secure admission to IIT',
            duration: 48,
            skills: ['Engineering Fundamentals', 'Programming', 'Technical Skills'],
            credentials: ['B.Tech'],
          },
          {
            name: 'Entry Level Role',
            description: 'First job after IIT',
            duration: 24,
            skills: ['Industry Experience', 'Professional Skills'],
          },
          {
            name: 'Target Role',
            description: `Achieve ${targetCareer}`,
            duration: 24,
            skills: ['Leadership', 'Domain Expertise'],
          },
        ],
        difficulty: PathDifficulty.VERY_HARD,
        risk: PathRisk.HIGH,
        costMultiplier: 1.5,
        durationMultiplier: 1.2,
      };

      const careerEntry = this.careerDatabase.get(targetCareer.toLowerCase()) || {
        name: targetCareer,
        alternativeTitles: [],
        typicalPaths: [],
        entryLevelRoles: [],
        midLevelRoles: [],
        seniorLevelRoles: [],
        industries: ['Technology'],
        averageStartingSalary: 1500000,
        averageSalary5Years: 4000000,
      };

      paths.push(this.buildPathFromTemplate(template, targetCareer, careerEntry, input));
    }

    return paths;
  }

  /**
   * Generate entrepreneurial path
   */
  private generateEntrepreneurialPath(
    targetCareer: string,
    input: CareerPathIntelligenceInput
  ): CareerPath | null {
    const template: PathTemplate = {
      name: 'Entrepreneurial Route',
      type: PathType.ENTREPRENEURIAL,
      milestones: [
        {
          name: 'Skill Building',
          description: 'Build core skills independently',
          duration: 12,
          skills: ['Technical Skills', 'Business Basics'],
        },
        {
          name: 'First Venture',
          description: 'Start small business or freelance',
          duration: 24,
          skills: ['Entrepreneurship', 'Sales', 'Operations'],
        },
        {
          name: 'Growth Phase',
          description: 'Scale the venture or pivot',
          duration: 36,
          skills: ['Leadership', 'Fundraising', 'Strategy'],
        },
        {
          name: 'Target Achievement',
          description: `Achieve ${targetCareer} through entrepreneurship`,
          duration: 24,
          skills: ['Industry Leadership', 'Innovation'],
        },
      ],
      difficulty: PathDifficulty.EXTREME,
      risk: PathRisk.VERY_HIGH,
      costMultiplier: 0.8,
      durationMultiplier: 1.5,
    };

    const careerEntry = this.careerDatabase.get(targetCareer.toLowerCase()) || {
      name: targetCareer,
      alternativeTitles: [],
      typicalPaths: [],
      entryLevelRoles: [],
      midLevelRoles: [],
      seniorLevelRoles: [],
      industries: ['Technology'],
      averageStartingSalary: 0,
      averageSalary5Years: 5000000,
    };

    return this.buildPathFromTemplate(template, targetCareer, careerEntry, input);
  }

  /**
   * Generate generic paths when career not in database
   */
  private generateGenericPaths(
    targetCareer: string,
    input: CareerPathIntelligenceInput
  ): PathDiscoveryResult {
    const paths: CareerPath[] = [];

    // Direct path
    const directTemplate: PathTemplate = {
      name: 'Direct Path',
      type: PathType.DIRECT,
      milestones: [
        {
          name: 'Education',
          description: 'Complete relevant education',
          duration: 48,
          skills: ['Foundational Knowledge'],
        },
        {
          name: 'Entry Position',
          description: 'Start in entry-level role',
          duration: 24,
          skills: ['Industry Experience'],
        },
        {
          name: 'Skill Development',
          description: 'Build specialized skills',
          duration: 24,
          skills: ['Specialized Skills'],
        },
        {
          name: 'Target Role',
          description: `Achieve ${targetCareer}`,
          duration: 12,
          skills: ['Leadership', 'Expertise'],
        },
      ],
      difficulty: PathDifficulty.MODERATE,
      risk: PathRisk.MODERATE,
      costMultiplier: 1,
      durationMultiplier: 1,
    };

    const careerEntry: CareerEntry = {
      name: targetCareer,
      alternativeTitles: [],
      typicalPaths: [directTemplate],
      entryLevelRoles: [],
      midLevelRoles: [],
      seniorLevelRoles: [],
      industries: ['General'],
      averageStartingSalary: 600000,
      averageSalary5Years: 1500000,
    };

    paths.push(this.buildPathFromTemplate(directTemplate, targetCareer, careerEntry, input));

    return {
      targetCareer,
      paths,
      discoveryMethod: 'GENERATED',
      coverage: { direct: 1, indirect: 0, nonTraditional: 0 },
    };
  }

  /**
   * Link alternative paths
   */
  private linkAlternativePaths(paths: CareerPath[]): void {
    for (let i = 0; i < paths.length; i++) {
      // Each path's alternatives are all other paths to the same target
      paths[i].alternativePathIds = paths
        .filter((_, idx) => idx !== i)
        .map(p => p.pathId);
    }
  }

  /**
   * Calculate path coverage
   */
  private calculateCoverage(paths: CareerPath[]) {
    return {
      direct: paths.filter(p => p.type === PathType.DIRECT).length,
      indirect: paths.filter(p => p.type === PathType.INDIRECT).length,
      nonTraditional: paths.filter(
        p => p.type === PathType.NON_TRADITIONAL || p.type === PathType.ENTREPRENEURIAL
      ).length,
    };
  }

  /**
   * Estimate failure probability
   */
  private estimateFailureProbability(
    template: MilestoneTemplate,
    input: CareerPathIntelligenceInput
  ): number {
    let probability = 0.2;

    if (template.name.toLowerCase().includes('jee')) probability = 0.7;
    if (template.name.toLowerCase().includes('neet')) probability = 0.8;
    if (template.name.toLowerCase().includes('upsc')) probability = 0.9;
    if (template.name.toLowerCase().includes('startup')) probability = 0.6;

    return probability;
  }

  /**
   * Generate unique path ID
   */
  private generatePathId(targetCareer: string, pathName: string): PathId {
    const sanitized = `${targetCareer}_${pathName}`.replace(/\s+/g, '_').toLowerCase();
    return `${sanitized}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize career database
   */
  private initializeCareerDatabase(): Map<string, CareerEntry> {
    const database = new Map<string, CareerEntry>();

    // Product Manager
    database.set('product manager', {
      name: 'Product Manager',
      alternativeTitles: ['PM', 'Product Owner', 'Product Lead'],
      typicalPaths: [
        {
          name: 'Engineering Route',
          type: PathType.DIRECT,
          milestones: [
            {
              name: 'B.Tech/BE',
              description: 'Engineering degree from reputed college',
              duration: 48,
              skills: ['Programming', 'System Design', 'Problem Solving'],
              credentials: ['B.Tech'],
            },
            {
              name: 'Software Engineer',
              description: 'Build technical foundation',
              duration: 36,
              skills: ['Software Development', 'Technical Architecture', 'Teamwork'],
            },
            {
              name: 'Senior Engineer/Tech Lead',
              description: 'Technical leadership experience',
              duration: 24,
              skills: ['Technical Leadership', 'Mentoring', 'Architecture'],
            },
            {
              name: 'Associate Product Manager',
              description: 'Transition to product',
              duration: 18,
              skills: ['Product Thinking', 'User Research', 'Analytics'],
            },
            {
              name: 'Product Manager',
              description: 'Full product ownership',
              duration: 24,
              skills: ['Product Strategy', 'Stakeholder Management', 'Roadmapping'],
            },
          ],
          difficulty: PathDifficulty.HARD,
          risk: PathRisk.MODERATE,
          costMultiplier: 1.2,
          durationMultiplier: 1,
        },
        {
          name: 'Business Route',
          type: PathType.INDIRECT,
          milestones: [
            {
              name: 'BBA/MBA',
              description: 'Business education',
              duration: 48,
              skills: ['Business Fundamentals', 'Marketing', 'Finance'],
              credentials: ['BBA'],
            },
            {
              name: 'Business Analyst',
              description: 'Analytics foundation',
              duration: 24,
              skills: ['Data Analysis', 'SQL', 'Business Communication'],
            },
            {
              name: 'Associate Product Manager',
              description: 'Product transition',
              duration: 24,
              skills: ['Product Management', 'Agile', 'User Stories'],
            },
            {
              name: 'Product Manager',
              description: 'Full product ownership',
              duration: 24,
              skills: ['Product Strategy', 'Leadership'],
            },
          ],
          difficulty: PathDifficulty.MODERATE,
          risk: PathRisk.MODERATE,
          costMultiplier: 1,
          durationMultiplier: 0.9,
        },
        {
          name: 'Startup Route',
          type: PathType.NON_TRADITIONAL,
          milestones: [
            {
              name: 'Any Degree/Experience',
              description: 'Build domain knowledge',
              duration: 24,
              skills: ['Domain Expertise', 'Self-Learning'],
            },
            {
              name: 'Startup Early Employee',
              description: 'Join early stage startup',
              duration: 24,
              skills: ['Hustle', 'Multiple Hats', 'Execution'],
            },
            {
              name: 'Product Operations',
              description: 'Product-adjacent role',
              duration: 18,
              skills: ['Product Analytics', 'Operations', 'User Feedback'],
            },
            {
              name: 'Product Manager',
              description: 'Product ownership',
              duration: 18,
              skills: ['Product Strategy', 'Growth'],
            },
          ],
          difficulty: PathDifficulty.HARD,
          risk: PathRisk.HIGH,
          costMultiplier: 0.7,
          durationMultiplier: 0.8,
        },
      ],
      entryLevelRoles: ['Associate Product Manager', 'Product Analyst', 'Business Analyst'],
      midLevelRoles: ['Product Manager', 'Senior Product Manager'],
      seniorLevelRoles: ['Product Lead', 'Director of Product', 'VP Product'],
      industries: ['Technology', 'E-commerce', 'Finance', 'Healthcare'],
      averageStartingSalary: 1800000,
      averageSalary5Years: 5000000,
    });

    // Software Engineer
    database.set('software engineer', {
      name: 'Software Engineer',
      alternativeTitles: ['Software Developer', 'Coder', 'Programmer', 'SDE'],
      typicalPaths: [
        {
          name: 'Engineering College',
          type: PathType.DIRECT,
          milestones: [
            {
              name: 'B.Tech/BE CSE',
              description: 'Computer Science degree',
              duration: 48,
              skills: ['Programming', 'Algorithms', 'Data Structures', 'DBMS'],
              credentials: ['B.Tech'],
            },
            {
              name: 'Software Engineer I',
              description: 'Entry level developer',
              duration: 24,
              skills: ['Coding', 'Debugging', 'Version Control'],
            },
            {
              name: 'Software Engineer II',
              description: 'Mid-level developer',
              duration: 24,
              skills: ['System Design', 'Code Review', 'Mentoring'],
            },
            {
              name: 'Senior Software Engineer',
              description: 'Senior developer',
              duration: 36,
              skills: ['Architecture', 'Leadership', 'Technical Decision Making'],
            },
          ],
          difficulty: PathDifficulty.MODERATE,
          risk: PathRisk.LOW,
          costMultiplier: 1,
          durationMultiplier: 1,
        },
      ],
      entryLevelRoles: ['Software Engineer I', 'Junior Developer', 'Associate Engineer'],
      midLevelRoles: ['Software Engineer II', 'Senior Engineer'],
      seniorLevelRoles: ['Staff Engineer', 'Principal Engineer', 'Engineering Manager'],
      industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce'],
      averageStartingSalary: 800000,
      averageSalary5Years: 2500000,
    });

    // Data Scientist
    database.set('data scientist', {
      name: 'Data Scientist',
      alternativeTitles: ['Data Analyst', 'ML Engineer', 'AI Engineer'],
      typicalPaths: [
        {
          name: 'Academic Route',
          type: PathType.ACADEMIC,
          milestones: [
            {
              name: 'B.Tech/MSc',
              description: 'Technical degree with math/stats',
              duration: 48,
              skills: ['Mathematics', 'Statistics', 'Programming'],
              credentials: ['B.Tech/MSc'],
            },
            {
              name: 'Masters/PhD',
              description: 'Advanced degree',
              duration: 36,
              skills: ['Machine Learning', 'Research', 'Advanced Statistics'],
              credentials: ['MS/PhD'],
            },
            {
              name: 'Data Scientist',
              description: 'Entry level DS',
              duration: 24,
              skills: ['Modeling', 'Data Processing', 'Business Understanding'],
            },
          ],
          difficulty: PathDifficulty.HARD,
          risk: PathRisk.MODERATE,
          costMultiplier: 1.5,
          durationMultiplier: 1.3,
        },
        {
          name: 'Industry Route',
          type: PathType.CORPORATE,
          milestones: [
            {
              name: 'B.Tech/BE',
              description: 'Engineering degree',
              duration: 48,
              skills: ['Programming', 'Basics of ML'],
              credentials: ['B.Tech'],
            },
            {
              name: 'Software Engineer',
              description: 'Build coding skills',
              duration: 24,
              skills: ['Programming', 'Data Handling'],
            },
            {
              name: 'Data Analyst',
              description: 'Analytics transition',
              duration: 18,
              skills: ['SQL', 'Visualization', 'Statistics'],
            },
            {
              name: 'Data Scientist',
              description: 'Full DS role',
              duration: 24,
              skills: ['Machine Learning', 'Deep Learning', 'MLOps'],
            },
          ],
          difficulty: PathDifficulty.MODERATE,
          risk: PathRisk.MODERATE,
          costMultiplier: 1,
          durationMultiplier: 1,
        },
      ],
      entryLevelRoles: ['Data Analyst', 'Junior Data Scientist', 'ML Engineer'],
      midLevelRoles: ['Data Scientist', 'Senior Data Scientist'],
      seniorLevelRoles: ['Lead Data Scientist', 'Principal Scientist', 'Head of AI'],
      industries: ['Technology', 'Finance', 'Healthcare', 'Consulting'],
      averageStartingSalary: 1000000,
      averageSalary5Years: 3500000,
    });

    return database;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PathDiscoveryEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function
 */
export function createPathDiscoveryEngine(
  config?: Partial<PathDiscoveryEngineConfig>
): PathDiscoveryEngine {
  return new PathDiscoveryEngine(config);
}
