/**
 * Action Intelligence - Skill Gap Engine
 *
 * Identifies gaps between current skills and target career requirements.
 * Generates skill development plans and learning pathways.
 *
 * @module intelligence/action-intelligence
 */

import type {
  EntityId,
  StudentBelief,
  CareerPath,
  Strength,
} from '../../types';

import type {
  SkillGap,
  SkillGapAnalysis,
  SkillAssessment,
  SkillRequirement,
  LearningStep,
  SkillDevelopmentPlan,
  ActionIntelligenceInput,
  ResourceRequirement,
} from '../types';

/**
 * Skill Gap Engine Configuration
 */
export interface SkillGapEngineConfig {
  /** Minimum skill level to consider "acquired" */
  minimumSkillLevel: number;

  /** Gap threshold for critical skills */
  criticalGapThreshold: number;

  /** Whether to include optional skills */
  includeOptionalSkills: boolean;

  /** Maximum gap size to attempt closing */
  maxGapSize: number;

  /** Hours per skill level */
  hoursPerSkillLevel: number;

  /** Whether to suggest certifications */
  suggestCertifications: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_SKILL_GAP_CONFIG: SkillGapEngineConfig = {
  minimumSkillLevel: 0.3,
  criticalGapThreshold: 0.5,
  includeOptionalSkills: true,
  maxGapSize: 0.8,
  hoursPerSkillLevel: 50,
  suggestCertifications: true,
};

/**
 * Skill Gap Engine
 *
 * Analyzes skill gaps and creates development plans.
 */
export class SkillGapEngine {
  private config: SkillGapEngineConfig;

  constructor(config: Partial<SkillGapEngineConfig> = {}) {
    this.config = { ...DEFAULT_SKILL_GAP_CONFIG, ...config };
  }

  /**
   * Analyze skill gaps for a target career
   */
  analyze(
    input: ActionIntelligenceInput,
    targetCareer?: string
  ): SkillGapAnalysis {
    const target = targetCareer || input.targetCareer || 'Target Career';

    // Extract current skills from student belief
    const currentSkills = this.extractCurrentSkills(input.studentBelief);

    // Define required skills for target career
    const requiredSkills = this.defineRequiredSkills(target);

    // Calculate gaps
    const gaps = this.calculateGaps(currentSkills, requiredSkills);

    // Classify gaps
    const criticalGaps = gaps.filter(g => g.isCritical && g.gapSize > this.config.criticalGapThreshold);
    const optionalGaps = gaps.filter(g => !g.isCritical);

    // Calculate total time
    const totalTimeToClose = gaps.reduce((sum, g) => sum + g.timeToAcquire, 0);

    // Determine priority order
    const priorityOrder = this.determinePriorityOrder(gaps);

    return {
      targetId: `career_${target.toLowerCase().replace(/\s+/g, '_')}`,
      currentSkills,
      requiredSkills,
      gaps,
      criticalGaps,
      optionalGaps,
      totalTimeToClose,
      priorityOrder,
    };
  }

  /**
   * Create a comprehensive skill development plan
   */
  createDevelopmentPlan(
    analysis: SkillGapAnalysis,
    input: ActionIntelligenceInput
  ): SkillDevelopmentPlan {
    // Build learning pathway
    const learningPathway = this.buildLearningPathway(analysis.gaps);

    // Suggest practice projects
    const practiceProjects = this.suggestPracticeProjects(
      analysis.targetId,
      analysis.criticalGaps
    );

    // Define validation methods
    const validationMethods = this.defineValidationMethods(analysis.gaps);

    // Calculate resources needed
    const resources = this.calculateResources(analysis.gaps);

    // Estimate timeline
    const timeline = this.estimateTimeline(analysis.totalTimeToClose, input);

    return {
      targetCareer: analysis.targetId.replace('career_', '').replace(/_/g, ' '),
      currentSkillProfile: analysis.currentSkills,
      targetSkillProfile: analysis.requiredSkills,
      gaps: analysis.gaps,
      learningPathway,
      practiceProjects,
      validationMethods,
      timeline,
      resources,
    };
  }

  /**
   * Extract current skills from student belief
   */
  private extractCurrentSkills(studentBelief: StudentBelief): SkillAssessment[] {
    const skills: SkillAssessment[] = [];

    // Extract from strengths
    if ('strengths' in studentBelief && Array.isArray(studentBelief.strengths)) {
      studentBelief.strengths.forEach((strength: Strength) => {
        skills.push({
          skillId: strength.id,
          skillName: strength.name,
          level: strength.level || 0.5,
          evidence: strength.evidence?.map(e => e.explanation) || [],
          lastAssessed: Date.now(),
        });
      });
    }

    // Add skills from current context if available
    if ('currentContext' in studentBelief) {
      const context = (studentBelief as any).currentContext;
      if (context?.currentSkills) {
        context.currentSkills.forEach((skillName: string) => {
          if (!skills.find(s => s.skillName.toLowerCase() === skillName.toLowerCase())) {
            skills.push({
              skillId: `skill_${skillName.toLowerCase().replace(/\s+/g, '_')}`,
              skillName,
              level: 0.5, // Assume medium level for explicitly mentioned skills
              evidence: ['Self-reported skill'],
              lastAssessed: Date.now(),
            });
          }
        });
      }
    }

    return skills;
  }

  /**
   * Define required skills for a target career
   */
  private defineRequiredSkills(targetCareer: string): SkillRequirement[] {
    // This would ideally come from a career database
    // For now, we'll define common skills for popular careers

    const careerSkillsMap: Record<string, SkillRequirement[]> = {
      'Software Engineer': [
        { skillId: 'skill_programming', skillName: 'Programming', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Core technical skill' },
        { skillId: 'skill_data_structures', skillName: 'Data Structures & Algorithms', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Essential for coding interviews' },
        { skillId: 'skill_system_design', skillName: 'System Design', minimumLevel: 0.5, preferredLevel: 0.8, isRequired: false, rationale: 'Important for senior roles' },
        { skillId: 'skill_version_control', skillName: 'Version Control (Git)', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Standard industry practice' },
        { skillId: 'skill_problem_solving', skillName: 'Problem Solving', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Core competency' },
        { skillId: 'skill_communication', skillName: 'Technical Communication', minimumLevel: 0.5, preferredLevel: 0.7, isRequired: true, rationale: 'Team collaboration' },
      ],
      'Product Manager': [
        { skillId: 'skill_product_thinking', skillName: 'Product Thinking', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Core PM skill' },
        { skillId: 'skill_analytics', skillName: 'Data Analytics', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Data-driven decisions' },
        { skillId: 'skill_user_research', skillName: 'User Research', minimumLevel: 0.5, preferredLevel: 0.8, isRequired: true, rationale: 'Understanding users' },
        { skillId: 'skill_communication', skillName: 'Communication', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Cross-functional collaboration' },
        { skillId: 'skill_prioritization', skillName: 'Prioritization', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Resource allocation' },
        { skillId: 'skill_stakeholder_management', skillName: 'Stakeholder Management', minimumLevel: 0.5, preferredLevel: 0.8, isRequired: false, rationale: 'Leadership skill' },
      ],
      'Data Scientist': [
        { skillId: 'skill_statistics', skillName: 'Statistics', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Foundation of data science' },
        { skillId: 'skill_programming', skillName: 'Programming (Python/R)', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Implementation' },
        { skillId: 'skill_machine_learning', skillName: 'Machine Learning', minimumLevel: 0.6, preferredLevel: 0.85, isRequired: true, rationale: 'Core DS skill' },
        { skillId: 'skill_data_visualization', skillName: 'Data Visualization', minimumLevel: 0.5, preferredLevel: 0.8, isRequired: true, rationale: 'Communication of insights' },
        { skillId: 'skill_sql', skillName: 'SQL', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Data extraction' },
        { skillId: 'skill_domain_expertise', skillName: 'Domain Expertise', minimumLevel: 0.4, preferredLevel: 0.7, isRequired: false, rationale: 'Context for analysis' },
      ],
      'UX Designer': [
        { skillId: 'skill_user_research', skillName: 'User Research', minimumLevel: 0.6, preferredLevel: 0.85, isRequired: true, rationale: 'Understanding users' },
        { skillId: 'skill_wireframing', skillName: 'Wireframing', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Design communication' },
        { skillId: 'skill_prototyping', skillName: 'Prototyping', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Testing designs' },
        { skillId: 'skill_visual_design', skillName: 'Visual Design', minimumLevel: 0.5, preferredLevel: 0.8, isRequired: true, rationale: 'Aesthetic execution' },
        { skillId: 'skill_usability_testing', skillName: 'Usability Testing', minimumLevel: 0.5, preferredLevel: 0.8, isRequired: true, rationale: 'Validation' },
        { skillId: 'skill_design_tools', skillName: 'Design Tools (Figma/Sketch)', minimumLevel: 0.7, preferredLevel: 0.9, isRequired: true, rationale: 'Production work' },
      ],
    };

    // Return skills for target career or generic skills
    return careerSkillsMap[targetCareer] || this.getGenericSkills(targetCareer);
  }

  /**
   * Get generic skills for any career
   */
  private getGenericSkills(targetCareer: string): SkillRequirement[] {
    return [
      { skillId: 'skill_communication', skillName: 'Communication', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Universal professional skill' },
      { skillId: 'skill_problem_solving', skillName: 'Problem Solving', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Core competency' },
      { skillId: 'skill_time_management', skillName: 'Time Management', minimumLevel: 0.5, preferredLevel: 0.7, isRequired: true, rationale: 'Productivity' },
      { skillId: 'skill_teamwork', skillName: 'Teamwork', minimumLevel: 0.6, preferredLevel: 0.8, isRequired: true, rationale: 'Collaboration' },
      { skillId: 'skill_learning', skillName: 'Continuous Learning', minimumLevel: 0.6, preferredLevel: 0.9, isRequired: true, rationale: 'Career growth' },
    ];
  }

  /**
   * Calculate skill gaps
   */
  private calculateGaps(
    currentSkills: SkillAssessment[],
    requiredSkills: SkillRequirement[]
  ): SkillGap[] {
    const gaps: SkillGap[] = [];

    for (const required of requiredSkills) {
      // Find matching current skill
      const current = currentSkills.find(
        cs => cs.skillName.toLowerCase() === required.skillName.toLowerCase() ||
              cs.skillId === required.skillId
      );

      const currentLevel = current?.level || 0;
      const gapSize = Math.max(0, required.minimumLevel - currentLevel);

      // Only include if there's a meaningful gap
      if (gapSize > 0.1) {
        const timeToAcquire = this.estimateLearningTime(gapSize, required.isRequired);

        gaps.push({
          skillId: required.skillId,
          skillName: required.skillName,
          currentLevel,
          requiredLevel: required.minimumLevel,
          gapSize,
          isCritical: required.isRequired && gapSize > this.config.criticalGapThreshold,
          timeToAcquire,
          resourcesNeeded: this.estimateResources(timeToAcquire),
          learningPath: this.generateLearningPath(required, gapSize),
          strategicImportance: required.rationale,
        });
      }
    }

    return gaps;
  }

  /**
   * Estimate learning time for a skill gap
   */
  private estimateLearningTime(gapSize: number, isRequired: boolean): number {
    // Base hours from gap size
    const baseHours = gapSize * this.config.hoursPerSkillLevel * 10;

    // Required skills take more time (need to be solid)
    const requiredMultiplier = isRequired ? 1.5 : 1;

    return Math.round(baseHours * requiredMultiplier);
  }

  /**
   * Estimate resources needed
   */
  private estimateResources(hours: number): ResourceRequirement[] {
    const resources: ResourceRequirement[] = [];

    // Time resource
    resources.push({
      type: 'TIME',
      amount: hours,
      unit: 'hours',
      isNegotiable: false,
    });

    // Money resource (courses, materials)
    const estimatedCost = Math.min(hours * 100, 50000); // Max 50k
    resources.push({
      type: 'MONEY',
      amount: estimatedCost,
      unit: 'INR',
      isNegotiable: true,
    });

    return resources;
  }

  /**
   * Generate learning path for a skill
   */
  private generateLearningPath(
    requirement: SkillRequirement,
    gapSize: number
  ): LearningStep[] {
    const steps: LearningStep[] = [];
    const numSteps = Math.ceil(gapSize * 5); // 1-5 steps depending on gap

    for (let i = 0; i < numSteps; i++) {
      const order = i + 1;
      const progress = (i + 1) / numSteps;

      steps.push({
        order,
        title: this.getLearningStepTitle(requirement.skillName, order, numSteps),
        description: this.getLearningStepDescription(requirement.skillName, progress),
        resources: this.getLearningResources(requirement.skillName, order),
        estimatedTime: Math.round(requirement.minimumLevel * this.config.hoursPerSkillLevel),
        validationMethod: this.getValidationMethod(requirement.skillName, order),
      });
    }

    return steps;
  }

  /**
   * Get learning step title
   */
  private getLearningStepTitle(skillName: string, step: number, total: number): string {
    const phases = ['Foundation', 'Basics', 'Intermediate', 'Advanced', 'Mastery'];
    const phase = phases[Math.min(step - 1, phases.length - 1)];
    return `${phase}: ${skillName} - Level ${step}/${total}`;
  }

  /**
   * Get learning step description
   */
  private getLearningStepDescription(skillName: string, progress: number): string {
    if (progress < 0.3) {
      return `Learn fundamental concepts and terminology of ${skillName}.`;
    } else if (progress < 0.6) {
      return `Practice ${skillName} through guided exercises and small projects.`;
    } else if (progress < 0.8) {
      return `Apply ${skillName} to real-world scenarios and complex problems.`;
    }
    return `Master ${skillName} through advanced projects and teaching others.`;
  }

  /**
   * Get learning resources
   */
  private getLearningResources(skillName: string, step: number): string[] {
    const resources: string[] = [];

    if (step === 1) {
      resources.push(`Online course: ${skillName} Fundamentals`);
      resources.push(`Book: Introduction to ${skillName}`);
    } else if (step === 2) {
      resources.push(`Tutorial series: ${skillName} in Practice`);
      resources.push(`Practice platform: ${skillName} exercises`);
    } else if (step === 3) {
      resources.push(`Project-based course: Build with ${skillName}`);
      resources.push(`YouTube: ${skillName} advanced techniques`);
    } else {
      resources.push(`Documentation: Official ${skillName} resources`);
      resources.push(`Community: ${skillName} forums and groups`);
    }

    return resources;
  }

  /**
   * Get validation method for a learning step
   */
  private getValidationMethod(skillName: string, step: number): string {
    if (step === 1) {
      return `Quiz on ${skillName} fundamentals`;
    } else if (step <= 3) {
      return `Complete practice project using ${skillName}`;
    }
    return `Build independent project demonstrating ${skillName} mastery`;
  }

  /**
   * Determine priority order for closing gaps
   */
  private determinePriorityOrder(gaps: SkillGap[]): string[] {
    // Sort by criticality and gap size
    const sorted = gaps.sort((a, b) => {
      // Critical skills first
      if (a.isCritical && !b.isCritical) return -1;
      if (!a.isCritical && b.isCritical) return 1;

      // Then by gap size
      return b.gapSize - a.gapSize;
    });

    return sorted.map(g => g.skillId);
  }

  /**
   * Build an ordered learning pathway across all skill gaps.
   */
  private buildLearningPathway(gaps: SkillGap[]): LearningStep[] {
    return gaps.flatMap((gap) =>
      this.generateLearningPath(
        {
          skillId: gap.skillId,
          skillName: gap.skillName,
          minimumLevel: gap.requiredLevel,
          preferredLevel: gap.requiredLevel,
          isRequired: gap.isCritical,
          rationale: gap.isCritical ? 'Critical skill gap' : 'Optional skill gap',
        },
        gap.gapSize
      )
    );
  }

  /**
   * Suggest practice projects
   */
  private suggestPracticeProjects(
    targetId: string,
    criticalGaps: SkillGap[]
  ): string[] {
    const career = targetId.replace('career_', '').replace(/_/g, ' ');
    const projects: string[] = [];

    // Suggest projects based on target career and critical gaps
    if (career.includes('Software Engineer')) {
      projects.push('Build a personal portfolio website');
      projects.push('Create a CRUD application with database');
      projects.push('Develop a REST API with authentication');
      projects.push('Contribute to an open source project');
    } else if (career.includes('Product Manager')) {
      projects.push('Write a PRD for an existing product improvement');
      projects.push('Conduct user research on a product you use');
      projects.push('Create a product strategy document');
      projects.push('Analyze product metrics and recommend improvements');
    } else if (career.includes('Data Scientist')) {
      projects.push('Analyze a public dataset and create visualizations');
      projects.push('Build a predictive model for a Kaggle competition');
      projects.push('Create a dashboard for real-time data');
      projects.push('Write a data analysis report with recommendations');
    } else if (career.includes('UX Designer')) {
      projects.push('Redesign an app interface with user research');
      projects.push('Create a design system for a product');
      projects.push('Conduct usability testing on an existing product');
      projects.push('Design a mobile app from concept to prototype');
    } else {
      projects.push(`Create a portfolio piece demonstrating ${career} skills`);
      projects.push('Document a case study of solving a real problem');
      projects.push('Build something that solves a problem you face');
    }

    return projects;
  }

  /**
   * Define validation methods for skills
   */
  private defineValidationMethods(gaps: SkillGap[]): string[] {
    const methods: string[] = [];

    // Add common validation methods
    methods.push('Complete online assessments and quizzes');
    methods.push('Build portfolio projects demonstrating skills');
    methods.push('Earn industry-recognized certifications');
    methods.push('Receive feedback from industry professionals');
    methods.push('Successfully complete practical exercises');

    // Add specific methods based on gaps
    const hasTechnicalGaps = gaps.some(g =>
      ['Programming', 'Data', 'Engineering', 'Analytics'].some(t =>
        g.skillName.includes(t)
      )
    );

    if (hasTechnicalGaps) {
      methods.push('Pass technical interviews or coding challenges');
      methods.push('Contribute to technical projects or open source');
    }

    return methods;
  }

  /**
   * Calculate total resources needed
   */
  private calculateResources(gaps: SkillGap[]): ResourceRequirement[] {
    const totalHours = gaps.reduce((sum, g) => sum + g.timeToAcquire, 0);
    const totalCost = gaps.reduce((sum, g) => {
      const moneyResource = g.resourcesNeeded.find(r => r.type === 'MONEY');
      return sum + (moneyResource?.amount || 0);
    }, 0);

    return [
      {
        type: 'TIME',
        amount: totalHours,
        unit: 'hours',
        description: `Total learning time across ${gaps.length} skills`,
        isNegotiable: false,
      },
      {
        type: 'MONEY',
        amount: totalCost,
        unit: 'INR',
        description: 'Courses, materials, and certification costs',
        isNegotiable: true,
      },
    ];
  }

  /**
   * Estimate timeline for skill development
   */
  private estimateTimeline(
    totalHours: number,
    input: ActionIntelligenceInput
  ): string {
    // Assume 10 hours per week dedicated to skill building
    const hoursPerWeek = input.currentContext?.availableHoursPerWeek || 10;
    const weeks = Math.ceil(totalHours / hoursPerWeek);
    const months = Math.ceil(weeks / 4);

    if (months < 3) {
      return `${weeks} weeks (at ${hoursPerWeek} hours/week)`;
    } else if (months < 12) {
      return `${months} months (at ${hoursPerWeek} hours/week)`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} years${remainingMonths > 0 ? ` ${remainingMonths} months` : ''} (at ${hoursPerWeek} hours/week)`;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SkillGapEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SkillGapEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create SkillGapEngine
 */
export function createSkillGapEngine(
  config?: Partial<SkillGapEngineConfig>
): SkillGapEngine {
  return new SkillGapEngine(config);
}
