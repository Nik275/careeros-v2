/**
 * CareerOS Future Simulation Engine - Trajectory Engine
 *
 * Phase D.5: Future Simulation Engine
 *
 * Generates likely career progressions and trajectories.
 *
 * @module trajectory-engine
 * @version 1.0.0
 */

import type {
  CareerTrajectory,
  TrajectoryStep,
  AlternativePath,
  TrajectoryEndState,
  TransitionRequirement,
  TrajectoryAnalysis,
  DecisionPoint,
  TimeHorizon,
  ScenarioType,
  IncomeBand,
  LikelihoodEstimate,
  FutureSimulationConfig,
} from './future-simulation-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';

/**
 * Engine for generating career trajectories.
 */
export class TrajectoryEngine {
  /** Configuration */
  private config: FutureSimulationConfig;

  /**
   * Creates a new TrajectoryEngine.
   *
   * @param config - Configuration
   */
  constructor(config: FutureSimulationConfig) {
    this.config = config;
  }

  /**
   * Generates trajectory analysis for a career.
   *
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @param scenarioType - Scenario type
   * @returns Trajectory analysis
   */
  generateTrajectory(
    career: CareerIntelligence,
    timeHorizon: TimeHorizon,
    scenarioType: ScenarioType
  ): CareerTrajectory {
    const metadata = career.metadata;
    const category = metadata.category.toUpperCase();

    // Generate progression path based on category and scenario
    const path = this.generateProgressionPath(
      career.careerTitle,
      category,
      timeHorizon,
      scenarioType
    );

    // Generate alternative paths
    const alternativePaths = this.generateAlternativePaths(
      category,
      path,
      scenarioType
    );

    // Determine end state
    const endState = this.determineEndState(
      path,
      career,
      scenarioType
    );

    // Identify key transitions
    const keyTransitions = this.identifyTransitions(path);

    return {
      startingRole: career.careerTitle,
      path,
      alternativePaths,
      endState,
      keyTransitions,
    };
  }

  /**
   * Generates progression path based on category.
   *
   * @param startingRole - Starting role title
   * @param category - Career category
   * @param timeHorizon - Time horizon
   * @param scenarioType - Scenario type
   * @returns Progression steps
   */
  private generateProgressionPath(
    startingRole: string,
    category: string,
    timeHorizon: TimeHorizon,
    scenarioType: ScenarioType
  ): TrajectoryStep[] {
    const steps: TrajectoryStep[] = [];

    // Define progression patterns by category
    const progressionPatterns: Record<string, string[]> = {
      'ENGINEERING': ['Junior', 'Mid-Level', 'Senior', 'Staff', 'Principal', 'Distinguished'],
      'PRODUCT': ['Associate', 'Product Manager', 'Senior PM', 'Group PM', 'Director', 'VP'],
      'MARKETING': ['Coordinator', 'Manager', 'Senior Manager', 'Director', 'VP', 'CMO'],
      'SALES': ['Representative', 'Account Executive', 'Senior AE', 'Sales Manager', 'Director', 'VP'],
      'FINANCE': ['Analyst', 'Senior Analyst', 'Manager', 'Director', 'VP', 'CFO'],
      'CONSULTING': ['Analyst', 'Consultant', 'Senior Consultant', 'Manager', 'Partner', 'Managing Partner'],
      'OPERATIONS': ['Coordinator', 'Manager', 'Senior Manager', 'Director', 'VP', 'COO'],
      'RESEARCH': ['Researcher', 'Scientist', 'Senior Scientist', 'Principal Scientist', 'Research Director', 'Chief Scientist'],
      'DESIGN': ['Junior Designer', 'Designer', 'Senior Designer', 'Lead Designer', 'Design Director', 'VP Design'],
      'DATA': ['Analyst', 'Data Scientist', 'Senior Data Scientist', 'Staff Data Scientist', 'Principal', 'Chief Data Officer'],
    };

    const levels = progressionPatterns[category] ?? ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Director', 'Executive'];

    // Adjust progression speed by scenario
    const progressionSpeed = scenarioType === 'OPTIMISTIC' ? 0.7 : scenarioType === 'PESSIMISTIC' ? 1.3 : 1.0;

    // Generate steps
    const stepsCount = Math.min(levels.length, Math.ceil(timeHorizon / 3));

    for (let i = 0; i < stepsCount; i++) {
      const baseYears = (i + 1) * 2 * progressionSpeed;
      const estimatedYears = Math.min(baseYears, timeHorizon);

      if (estimatedYears > timeHorizon) break;

      steps.push({
        order: i + 1,
        role: `${levels[i]} ${startingRole.split(' ').pop() ?? ''}`,
        level: levels[i],
        estimatedYears,
        requirements: this.generateRequirements(i, category),
        probability: this.calculateStepProbability(i, stepsCount, scenarioType),
      });
    }

    return steps;
  }

  /**
   * Generates requirements for a step.
   *
   * @param stepIndex - Step index
   * @param category - Career category
   * @returns Requirements
   */
  private generateRequirements(stepIndex: number, category: string): string[] {
    const baseRequirements: Record<string, string[]> = {
      'ENGINEERING': [
        'Technical skill development',
        'Project ownership',
        'Code quality excellence',
        'Mentorship experience',
        'System design expertise',
        'Industry thought leadership',
      ],
      'PRODUCT': [
        'Product launches',
        'User research expertise',
        'Cross-functional leadership',
        'Strategy development',
        'Team management',
        'Business growth impact',
      ],
      'MARKETING': [
        'Campaign execution',
        'Brand development',
        'Analytics proficiency',
        'Team leadership',
        'Budget management',
        'Market expansion',
      ],
      'SALES': [
        'Quota achievement',
        'Client relationship building',
        'Territory expansion',
        'Team coaching',
        'Sales strategy',
        'Revenue growth',
      ],
      'FINANCE': [
        'Financial analysis',
        'Process improvement',
        'Team leadership',
        'Strategic planning',
        'Executive partnership',
        'Organizational impact',
      ],
      'CONSULTING': [
        'Client delivery',
        'Problem solving',
        'Business development',
        'Team leadership',
        'Practice building',
        'Firm leadership',
      ],
      'OPERATIONS': [
        'Process optimization',
        'Team management',
        'Strategic initiatives',
        'Cross-functional leadership',
        'Organizational design',
        'Executive decision making',
      ],
      'RESEARCH': [
        'Research output',
        'Publication record',
        'Grant acquisition',
        'Team leadership',
        'Research direction',
        'Scientific impact',
      ],
      'DESIGN': [
        'Design execution',
        'User research',
        'Design systems',
        'Team leadership',
        'Strategic design',
        'Organizational influence',
      ],
      'DATA': [
        'Analysis delivery',
        'Model development',
        'Business impact',
        'Team leadership',
        'Data strategy',
        'Organizational transformation',
      ],
    };

    const categoryRequirements = baseRequirements[category] ?? [
      'Skill development',
      'Project success',
      'Leadership demonstration',
      'Strategic contribution',
      'Organizational impact',
      'Executive presence',
    ];

    return categoryRequirements.slice(0, Math.min(stepIndex + 2, categoryRequirements.length));
  }

  /**
   * Calculates probability of reaching a step.
   *
   * @param stepIndex - Step index
   * @param totalSteps - Total steps
   * @param scenarioType - Scenario type
   * @returns Likelihood estimate
   */
  private calculateStepProbability(
    stepIndex: number,
    totalSteps: number,
    scenarioType: ScenarioType
  ): LikelihoodEstimate {
    const progress = stepIndex / totalSteps;

    // Base probability decreases as progress increases
    let probability = 1 - progress * 0.4;

    // Adjust by scenario
    if (scenarioType === 'OPTIMISTIC') {
      probability += 0.15;
    } else if (scenarioType === 'PESSIMISTIC') {
      probability -= 0.15;
    }

    // Map to likelihood
    if (probability >= 0.85) return 'VERY_LIKELY';
    if (probability >= 0.65) return 'LIKELY';
    if (probability >= 0.35) return 'POSSIBLE';
    if (probability >= 0.15) return 'UNLIKELY';
    return 'VERY_UNLIKELY';
  }

  /**
   * Generates alternative career paths.
   *
   * @param category - Career category
   * @param primaryPath - Primary progression path
   * @param scenarioType - Scenario type
   * @returns Alternative paths
   */
  private generateAlternativePaths(
    category: string,
    primaryPath: TrajectoryStep[],
    scenarioType: ScenarioType
  ): AlternativePath[] {
    const alternatives: AlternativePath[] = [];

    // Define alternative paths by category
    const alternativePatterns: Record<string, Array<{ name: string; description: string; targets: string[] }>> = {
      'ENGINEERING': [
        { name: 'Management Track', description: 'Transition to engineering management', targets: ['Engineering Manager', 'Director of Engineering', 'VP Engineering'] },
        { name: 'Specialist Track', description: 'Deep technical specialization', targets: ['Subject Matter Expert', 'Principal Engineer', 'Distinguished Engineer'] },
        { name: 'Product Transition', description: 'Move to product management', targets: ['Technical PM', 'Product Manager', 'Senior PM'] },
        { name: 'Entrepreneurship', description: 'Start or join early-stage company', targets: ['Founder', 'CTO', 'Technical Co-founder'] },
      ],
      'PRODUCT': [
        { name: 'Strategy Track', description: 'Move to strategic roles', targets: ['Strategy Manager', 'Chief of Staff', 'VP Strategy'] },
        { name: 'Operations Track', description: 'Transition to operations', targets: ['Operations Manager', 'COO', 'General Manager'] },
        { name: 'Entrepreneurship', description: 'Start own company', targets: ['Founder', 'CEO', 'Product Founder'] },
        { name: 'Consulting', description: 'Join consulting firm', targets: ['Product Consultant', 'Strategy Consultant', 'Partner'] },
      ],
      'MARKETING': [
        { name: 'Brand Track', description: 'Focus on brand management', targets: ['Brand Manager', 'Brand Director', 'VP Brand'] },
        { name: 'Growth Track', description: 'Focus on growth marketing', targets: ['Growth Manager', 'VP Growth', 'Chief Growth Officer'] },
        { name: 'Agency Path', description: 'Join or start agency', targets: ['Account Director', 'Agency Partner', 'Founder'] },
        { name: 'Product Transition', description: 'Move to product', targets: ['Product Marketing', 'Product Manager', 'VP Product'] },
      ],
      'SALES': [
        { name: 'Enterprise Track', description: 'Focus on enterprise sales', targets: ['Enterprise AE', 'Strategic Accounts', 'VP Enterprise'] },
        { name: 'Sales Operations', description: 'Move to sales ops', targets: ['Sales Ops Manager', 'VP Sales Ops', 'Chief Revenue Officer'] },
        { name: 'Customer Success', description: 'Transition to CS', targets: ['CS Manager', 'VP Customer Success', 'Chief Customer Officer'] },
        { name: 'Entrepreneurship', description: 'Start own business', targets: ['Founder', 'CEO', 'Sales Consultant'] },
      ],
      'FINANCE': [
        { name: 'FP&A Track', description: 'Focus on financial planning', targets: ['FP&A Manager', 'VP FP&A', 'Chief Financial Officer'] },
        { name: 'Strategic Finance', description: 'Move to strategic finance', targets: ['Strategic Finance Manager', 'VP Finance', 'CFO'] },
        { name: 'Investor Path', description: 'Move to investing', targets: ['Investment Analyst', 'Associate', 'Partner'] },
        { name: 'Consulting', description: 'Join consulting firm', targets: ['Finance Consultant', 'Managing Director', 'Partner'] },
      ],
      'CONSULTING': [
        { name: 'Industry Transition', description: 'Move to client industry', targets: ['Strategy Manager', 'Director', 'VP'] },
        { name: 'Private Equity', description: 'Move to PE/VC', targets: ['Associate', 'Principal', 'Partner'] },
        { name: 'Entrepreneurship', description: 'Start own company', targets: ['Founder', 'CEO', 'Managing Director'] },
        { name: 'Specialist Track', description: 'Deep expertise in one area', targets: ['Expert Practitioner', 'Thought Leader', 'Managing Partner'] },
      ],
      'OPERATIONS': [
        { name: 'Supply Chain', description: 'Focus on supply chain', targets: ['SC Manager', 'VP Supply Chain', 'COO'] },
        { name: 'Program Management', description: 'Move to program management', targets: ['Program Director', 'VP Programs', 'Chief of Staff'] },
        { name: 'General Management', description: 'Move to P&L ownership', targets: ['General Manager', 'VP/GM', 'President'] },
        { name: 'Consulting', description: 'Join operations consulting', targets: ['Operations Consultant', 'Partner', 'Managing Director'] },
      ],
      'RESEARCH': [
        { name: 'Industry Transition', description: 'Move to industry R&D', targets: ['Research Manager', 'Director R&D', 'VP Research'] },
        { name: 'Academic Track', description: 'Pursue academic career', targets: ['Assistant Professor', 'Associate Professor', 'Full Professor'] },
        { name: 'Policy Track', description: 'Move to policy/government', targets: ['Policy Analyst', 'Senior Advisor', 'Policy Director'] },
        { name: 'Entrepreneurship', description: 'Spin out company', targets: ['Founder', 'CSO', 'Chief Scientist'] },
      ],
      'DESIGN': [
        { name: 'Product Design', description: 'Focus on product design', targets: ['Senior Product Designer', 'Staff Designer', 'VP Design'] },
        { name: 'Design Management', description: 'Move to design leadership', targets: ['Design Manager', 'Director of Design', 'VP Design'] },
        { name: 'Consulting', description: 'Join design consulting', targets: ['Design Consultant', 'Creative Director', 'Partner'] },
        { name: 'Entrepreneurship', description: 'Start design-led company', targets: ['Founder', 'CDO', 'Creative Director'] },
      ],
      'DATA': [
        { name: 'ML Engineering', description: 'Move to ML engineering', targets: ['ML Engineer', 'Staff ML Engineer', 'Principal Engineer'] },
        { name: 'Product Analytics', description: 'Move to product analytics', targets: ['Product Analyst', 'Analytics Manager', 'VP Analytics'] },
        { name: 'Research Science', description: 'Focus on research', targets: ['Research Scientist', 'Senior Scientist', 'Distinguished Scientist'] },
        { name: 'Entrepreneurship', description: 'Start data company', targets: ['Founder', 'Chief Data Officer', 'Head of Data'] },
      ],
    };

    const patterns = alternativePatterns[category] ?? [
      { name: 'Specialization', description: 'Deep expertise in one area', targets: ['Specialist', 'Senior Specialist', 'Principal Specialist'] },
      { name: 'Management', description: 'Move to people management', targets: ['Manager', 'Director', 'VP'] },
      { name: 'Consulting', description: 'Become independent consultant', targets: ['Consultant', 'Senior Consultant', 'Partner'] },
    ];

    patterns.forEach((pattern, index) => {
      const branchPoint = Math.max(1, Math.min(primaryPath.length - 1, index + 1));
      const likelihood = this.calculateAlternativeLikelihood(pattern.name, scenarioType);

      alternatives.push({
        name: pattern.name,
        description: pattern.description,
        branchPoint,
        targetRoles: pattern.targets,
        likelihood,
      });
    });

    return alternatives.slice(0, this.config.maxTrajectoriesPerScenario);
  }

  /**
   * Calculates likelihood of alternative path.
   *
   * @param pathName - Path name
   * @param scenarioType - Scenario type
   * @returns Likelihood estimate
   */
  private calculateAlternativeLikelihood(
    pathName: string,
    scenarioType: ScenarioType
  ): LikelihoodEstimate {
    // Some paths are more/less likely
    const baseLikelihood: Record<string, number> = {
      'Management Track': 0.6,
      'Specialist Track': 0.5,
      'Product Transition': 0.3,
      'Entrepreneurship': 0.2,
      'Strategy Track': 0.35,
      'Consulting': 0.4,
      'Industry Transition': 0.45,
    };

    let probability = baseLikelihood[pathName] ?? 0.3;

    // Adjust by scenario
    if (scenarioType === 'OPTIMISTIC') {
      probability += 0.1;
    } else if (scenarioType === 'PESSIMISTIC') {
      probability -= 0.1;
    }

    // Map to likelihood
    if (probability >= 0.85) return 'VERY_LIKELY';
    if (probability >= 0.65) return 'LIKELY';
    if (probability >= 0.35) return 'POSSIBLE';
    if (probability >= 0.15) return 'UNLIKELY';
    return 'VERY_UNLIKELY';
  }

  /**
   * Determines end state of trajectory.
   *
   * @param path - Career path
   * @param career - Career intelligence
   * @param scenarioType - Scenario type
   * @returns End state
   */
  private determineEndState(
    path: TrajectoryStep[],
    career: CareerIntelligence,
    scenarioType: ScenarioType
  ): TrajectoryEndState {
    const lastStep = path[path.length - 1];

    // Determine scope based on level
    const scope = this.determineScope(lastStep.level);

    // Determine income band
    const incomeBand = this.determineIncomeBand(lastStep.level, career, scenarioType);

    // Estimate satisfaction
    const satisfaction = this.estimateSatisfaction(scenarioType, career);

    return {
      role: lastStep.role,
      level: lastStep.level,
      scope,
      incomeBand,
      estimatedSatisfaction: satisfaction,
    };
  }

  /**
   * Determines scope of responsibility.
   *
   * @param level - Career level
   * @returns Scope description
   */
  private determineScope(level: string): string {
    const scopeMap: Record<string, string> = {
      'Junior': 'Individual tasks and small projects',
      'Mid-Level': 'Project components and feature areas',
      'Senior': 'Full projects and team coordination',
      'Staff': 'Multiple teams and complex initiatives',
      'Principal': 'Organization-wide impact and strategy',
      'Distinguished': 'Industry-level influence and vision',
      'Associate': 'Support tasks and learning',
      'Coordinator': 'Coordination and administrative support',
      'Manager': 'Team management and delivery',
      'Director': 'Department leadership and strategy',
      'VP': 'Functional leadership and organizational strategy',
      'C-Level': 'Executive leadership and company direction',
      'Partner': 'Firm ownership and client leadership',
    };

    // Find matching scope
    for (const [key, value] of Object.entries(scopeMap)) {
      if (level.includes(key)) return value;
    }

    return 'Progressive responsibility growth';
  }

  /**
   * Determines income band.
   *
   * @param level - Career level
   * @param career - Career intelligence
   * @param scenarioType - Scenario type
   * @returns Income band
   */
  private determineIncomeBand(
    level: string,
    career: CareerIntelligence,
    scenarioType: ScenarioType
  ): IncomeBand {
    const baseSalary = career.metadata.averageSalary.median;

    // Level multipliers
    let multiplier = 1.0;
    if (level.includes('Junior') || level.includes('Associate')) multiplier = 0.7;
    else if (level.includes('Senior') || level.includes('Manager')) multiplier = 1.5;
    else if (level.includes('Staff') || level.includes('Director')) multiplier = 2.0;
    else if (level.includes('Principal') || level.includes('VP')) multiplier = 2.5;
    else if (level.includes('Distinguished') || level.includes('C-') || level.includes('Partner')) multiplier = 3.5;

    // Scenario adjustment
    if (scenarioType === 'OPTIMISTIC') multiplier *= 1.2;
    if (scenarioType === 'PESSIMISTIC') multiplier *= 0.85;

    const estimatedSalary = baseSalary * multiplier;

    // Map to band
    if (estimatedSalary < 60000) return 'ENTRY';
    if (estimatedSalary < 100000) return 'MID';
    if (estimatedSalary < 150000) return 'SENIOR';
    if (estimatedSalary < 250000) return 'EXECUTIVE';
    return 'TOP';
  }

  /**
   * Estimates satisfaction.
   *
   * @param scenarioType - Scenario type
   * @param career - Career intelligence
   * @returns Satisfaction estimate (0-100)
   */
  private estimateSatisfaction(
    scenarioType: ScenarioType,
    career: CareerIntelligence
  ): number {
    const baseSatisfaction = 60;

    // Adjust by scenario
    let adjustment = 0;
    if (scenarioType === 'OPTIMISTIC') adjustment = 20;
    if (scenarioType === 'EXPECTED') adjustment = 5;
    if (scenarioType === 'PESSIMISTIC') adjustment = -15;

    // Adjust by career advantages
    const advantages = career.careerAdvantages;
    if (advantages.careerMobility?.score ?? 0 > 70) adjustment += 5;
    if (advantages.salaryGrowth?.score ?? 0 > 70) adjustment += 5;
    if (advantages.optionality?.score ?? 0 > 70) adjustment += 5;

    return Math.max(0, Math.min(100, baseSatisfaction + adjustment));
  }

  /**
   * Identifies key transitions in path.
   *
   * @param path - Career path
   * @returns Transition requirements
   */
  private identifyTransitions(path: TrajectoryStep[]): TransitionRequirement[] {
    const transitions: TransitionRequirement[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];

      transitions.push({
        fromRole: current.role,
        toRole: next.role,
        requiredSkills: this.generateTransitionSkills(i),
        requiredExperience: `${Math.round(next.estimatedYears - current.estimatedYears)} years at current level`,
        difficulty: Math.min(90, 40 + i * 15),
      });
    }

    return transitions;
  }

  /**
   * Generates skills needed for transition.
   *
   * @param levelIndex - Level index
   * @returns Required skills
   */
  private generateTransitionSkills(levelIndex: number): string[] {
    const skillProgression: Record<number, string[]> = {
      0: ['Technical proficiency', 'Communication', 'Problem solving'],
      1: ['Advanced technical skills', 'Project management', 'Collaboration'],
      2: ['Leadership', 'Strategic thinking', 'Mentorship'],
      3: ['Team management', 'Stakeholder management', 'Business acumen'],
      4: ['Organizational leadership', 'Strategy development', 'Change management'],
      5: ['Executive presence', 'Vision setting', 'Organizational design'],
    };

    return skillProgression[levelIndex] ?? ['Leadership', 'Strategic thinking', 'Domain expertise'];
  }

  /**
   * Generates trajectory analysis with decision points.
   *
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @returns Trajectory analysis
   */
  generateTrajectoryAnalysis(
    career: CareerIntelligence,
    timeHorizon: TimeHorizon
  ): TrajectoryAnalysis {
    // Generate expected trajectory
    const primaryTrajectory = this.generateTrajectory(career, timeHorizon, 'EXPECTED');

    // Generate alternative trajectories
    const alternativeTrajectories: CareerTrajectory[] = [];
    const scenarios: ScenarioType[] = ['OPTIMISTIC', 'PESSIMISTIC'];

    scenarios.forEach((scenario) => {
      alternativeTrajectories.push(
        this.generateTrajectory(career, timeHorizon, scenario)
      );
    });

    // Generate decision points
    const decisionPoints = this.generateDecisionPoints(primaryTrajectory);

    return {
      careerId: career.careerId,
      primaryTrajectory,
      alternativeTrajectories,
      decisionPoints,
      confidence: career.evidence.overallConfidence,
    };
  }

  /**
   * Generates decision points in trajectory.
   *
   * @param trajectory - Career trajectory
   * @returns Decision points
   */
  private generateDecisionPoints(trajectory: CareerTrajectory): DecisionPoint[] {
    const points: DecisionPoint[] = [];

    // Key decision points based on transitions
    trajectory.keyTransitions.forEach((transition, index) => {
      points.push({
        id: `decision-${index}`,
        description: `Transition from ${transition.fromRole} to ${transition.toRole}`,
        timeframe: `Year ${Math.round((index + 1) * 2)}`,
        options: [
          'Pursue promotion to next level',
          'Switch to alternative career path',
          'Develop additional skills before advancing',
        ],
        implications: {
          'Pursue promotion to next level': 'Fastest career progression but higher risk',
          'Switch to alternative career path': 'May better align with long-term goals',
          'Develop additional skills before advancing': 'Stronger foundation but slower progression',
        },
      });
    });

    // Add alternative path decision point
    if (trajectory.alternativePaths.length > 0) {
      const altPath = trajectory.alternativePaths[0];
      points.push({
        id: 'decision-alternative',
        description: `Consider ${altPath.name} alternative`,
        timeframe: `Year ${altPath.branchPoint * 2}`,
        options: [
          'Continue on primary path',
          `Transition to ${altPath.name}`,
          'Explore both paths simultaneously',
        ],
        implications: {
          'Continue on primary path': 'Predictable progression in current direction',
          [`Transition to ${altPath.name}`]: `${altPath.description} - may better suit long-term goals`,
          'Explore both paths simultaneously': 'Keeps options open but requires more effort',
        },
      });
    }

    return points.slice(0, 4);
  }
}

/**
 * Creates a default trajectory engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured TrajectoryEngine
 */
export function createTrajectoryEngine(
  config?: Partial<FutureSimulationConfig>
): TrajectoryEngine {
  const fullConfig: FutureSimulationConfig = {
    ...import('./future-simulation-types').DEFAULT_FUTURE_SIMULATION_CONFIG,
    ...config,
  };

  return new TrajectoryEngine(fullConfig);
}
