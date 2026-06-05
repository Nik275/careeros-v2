/**
 * Career Path Intelligence - Milestone Engine
 *
 * Manages career path milestones including:
 * - Milestone planning and sequencing
 * - Critical path identification
 * - Parallel track management
 * - Timeline optimization
 * - Dependency management
 *
 * @module intelligence/career-path-intelligence
 */

import {
  CareerPath,
  Milestone,
  MilestonePlan,
  ParallelTrack,
  MilestoneStatus,
} from '../types';

/**
 * Milestone Engine Configuration
 */
export interface MilestoneEngineConfig {
  /** Default buffer time percentage */
  bufferPercentage: number;
  /** Enable parallel track optimization */
  enableParallelTracks: boolean;
  /** Critical path threshold (milestones that can't be delayed) */
  criticalPathThreshold: number;
  /** Maximum milestone duration in months */
  maxMilestoneDuration: number;
}

/**
 * Default configuration
 */
export const DEFAULT_MILESTONE_CONFIG: MilestoneEngineConfig = {
  bufferPercentage: 0.15,
  enableParallelTracks: true,
  criticalPathThreshold: 0.7,
  maxMilestoneDuration: 60,
};

/**
 * Milestone dependency graph node
 */
interface MilestoneNode {
  milestone: Milestone;
  dependencies: string[];
  dependents: string[];
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
}

/**
 * Milestone Engine
 */
export class MilestoneEngine {
  private config: MilestoneEngineConfig;

  constructor(config: Partial<MilestoneEngineConfig> = {}) {
    this.config = { ...DEFAULT_MILESTONE_CONFIG, ...config };
  }

  /**
   * Create a milestone plan from a career path
   */
  createMilestonePlan(path: CareerPath): MilestonePlan {
    // Build dependency graph
    const nodes = this.buildDependencyGraph(path.milestones);

    // Calculate critical path
    this.calculateCriticalPath(nodes);

    // Identify parallel tracks
    const parallelTracks = this.config.enableParallelTracks
      ? this.identifyParallelTracks(nodes)
      : [];

    // Calculate total duration with buffer
    const baseDuration = path.duration;
    const bufferTime = Math.ceil(baseDuration * this.config.bufferPercentage);
    const totalDuration = baseDuration + bufferTime;

    // Get critical path milestone IDs
    const criticalPath = nodes
      .filter(n => n.isCritical)
      .sort((a, b) => a.earliestStart - b.earliestStart)
      .map(n => n.milestone.id);

    return {
      pathId: path.pathId,
      pathName: path.name,
      milestones: path.milestones,
      totalDuration,
      criticalPath,
      parallelTracks,
      bufferTime,
    };
  }

  /**
   * Build dependency graph from milestones
   */
  private buildDependencyGraph(milestones: Milestone[]): MilestoneNode[] {
    const nodes: MilestoneNode[] = milestones.map(m => ({
      milestone: m,
      dependencies: [],
      dependents: [],
      earliestStart: 0,
      earliestFinish: 0,
      latestStart: 0,
      latestFinish: 0,
      slack: 0,
      isCritical: false,
    }));

    // Map milestone IDs to nodes
    const nodeMap = new Map<string, MilestoneNode>();
    for (const node of nodes) {
      nodeMap.set(node.milestone.id, node);
    }

    // Build dependencies based on order and prerequisites
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Sequential dependency on previous milestone
      if (i > 0) {
        const prevNode = nodes[i - 1];
        node.dependencies.push(prevNode.milestone.id);
        prevNode.dependents.push(node.milestone.id);
      }

      // Additional dependencies from prerequisites
      for (const prereq of node.milestone.prerequisites) {
        if (prereq.type === 'MILESTONE') {
          // Find milestone that satisfies this prerequisite
          const prereqNode = nodes.find(n =>
            n.milestone.name.toLowerCase().includes(prereq.description.toLowerCase())
          );
          if (prereqNode && !node.dependencies.includes(prereqNode.milestone.id)) {
            node.dependencies.push(prereqNode.milestone.id);
            prereqNode.dependents.push(node.milestone.id);
          }
        }
      }
    }

    return nodes;
  }

  /**
   * Calculate critical path using forward and backward pass
   */
  private calculateCriticalPath(nodes: MilestoneNode[]): void {
    // Forward pass - calculate earliest start/finish
    for (const node of nodes) {
      if (node.dependencies.length === 0) {
        node.earliestStart = 0;
      } else {
        node.earliestStart = Math.max(
          ...node.dependencies.map(depId => {
            const depNode = nodes.find(n => n.milestone.id === depId);
            return depNode ? depNode.earliestFinish : 0;
          })
        );
      }
      node.earliestFinish = node.earliestStart + node.milestone.expectedDuration;
    }

    // Backward pass - calculate latest start/finish
    const projectDuration = Math.max(...nodes.map(n => n.earliestFinish));

    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (node.dependents.length === 0) {
        node.latestFinish = projectDuration;
      } else {
        node.latestFinish = Math.min(
          ...node.dependents.map(depId => {
            const depNode = nodes.find(n => n.milestone.id === depId);
            return depNode ? depNode.latestStart : projectDuration;
          })
        );
      }
      node.latestStart = node.latestFinish - node.milestone.expectedDuration;
    }

    // Calculate slack and identify critical path
    for (const node of nodes) {
      node.slack = node.latestStart - node.earliestStart;
      // Critical if slack is 0 or very small
      node.isCritical = node.slack <= this.config.criticalPathThreshold;
    }
  }

  /**
   * Identify parallel tracks in the path
   */
  private identifyParallelTracks(nodes: MilestoneNode[]): ParallelTrack[] {
    const tracks: ParallelTrack[] = [];

    // Group milestones that can run in parallel (same earliest start, no dependencies)
    const startTimeMap = new Map<number, MilestoneNode[]>();

    for (const node of nodes) {
      const startTime = node.earliestStart;
      if (!startTimeMap.has(startTime)) {
        startTimeMap.set(startTime, []);
      }
      startTimeMap.get(startTime)!.push(node);
    }

    // Create tracks for groups with multiple milestones
    for (const [startTime, nodeGroup] of startTimeMap) {
      if (nodeGroup.length > 1) {
        // Check if they can truly run in parallel (no dependencies between them)
        const canParallel = nodeGroup.every(node =>
          nodeGroup.every(other =>
            node === other ||
            (!node.dependencies.includes(other.milestone.id) &&
             !other.dependencies.includes(node.milestone.id))
          )
        );

        if (canParallel) {
          tracks.push({
            name: `Parallel Track at Month ${startTime}`,
            milestones: nodeGroup.map(n => n.milestone.id),
            canRunParallel: true,
            dependencies: [
              ...new Set(
                nodeGroup.flatMap(n => n.dependencies)
              ),
            ],
          });
        }
      }
    }

    return tracks;
  }

  /**
   * Optimize milestone sequence for minimum duration
   */
  optimizeSequence(milestones: Milestone[]): Milestone[] {
    // Build dependency graph
    const nodes = this.buildDependencyGraph(milestones);

    // Calculate critical path
    this.calculateCriticalPath(nodes);

    // Sort by earliest start while respecting dependencies
    const optimized = [...nodes].sort((a, b) => {
      // First by earliest start
      if (a.earliestStart !== b.earliestStart) {
        return a.earliestStart - b.earliestStart;
      }
      // Then by order
      return a.milestone.order - b.milestone.order;
    });

    return optimized.map(n => n.milestone);
  }

  /**
   * Get current milestone for a path
   */
  getCurrentMilestone(path: CareerPath): Milestone | null {
    if (path.currentMilestoneIndex >= path.milestones.length) {
      return null;
    }
    return path.milestones[path.currentMilestoneIndex];
  }

  /**
   * Check if milestone is on critical path
   */
  isOnCriticalPath(milestoneId: string, plan: MilestonePlan): boolean {
    return plan.criticalPath.includes(milestoneId);
  }

  /**
   * Calculate milestone progress
   */
  calculateProgress(milestone: Milestone): number {
    if (milestone.status === MilestoneStatus.COMPLETED) {
      return 100;
    }
    if (milestone.status === MilestoneStatus.NOT_STARTED) {
      return 0;
    }
    if (milestone.status === MilestoneStatus.IN_PROGRESS && milestone.actualDuration) {
      return Math.min(
        100,
        Math.round((milestone.actualDuration / milestone.expectedDuration) * 100)
      );
    }
    return 0;
  }

  /**
   * Estimate completion date
   */
  estimateCompletionDate(
    path: CareerPath,
    startDate: Date = new Date()
  ): Date {
    const plan = this.createMilestonePlan(path);
    const completionDate = new Date(startDate);
    completionDate.setMonth(completionDate.getMonth() + plan.totalDuration);
    return completionDate;
  }

  /**
   * Get milestones by status
   */
  getMilestonesByStatus(
    path: CareerPath,
    status: MilestoneStatus
  ): Milestone[] {
    return path.milestones.filter(m => m.status === status);
  }

  /**
   * Get upcoming milestones
   */
  getUpcomingMilestones(
    path: CareerPath,
    count: number = 3
  ): Milestone[] {
    const currentIndex = path.currentMilestoneIndex;
    return path.milestones
      .filter(m => m.order > currentIndex)
      .sort((a, b) => a.order - b.order)
      .slice(0, count);
  }

  /**
   * Get milestone dependencies
   */
  getMilestoneDependencies(
    milestoneId: string,
    path: CareerPath
  ): Milestone[] {
    const milestone = path.milestones.find(m => m.id === milestoneId);
    if (!milestone) return [];

    return path.milestones.filter(m =>
      milestone.prerequisites.some(p =>
        p.type === 'MILESTONE' &&
        m.name.toLowerCase().includes(p.description.toLowerCase())
      )
    );
  }

  /**
   * Check if milestone prerequisites are satisfied
   */
  arePrerequisitesSatisfied(
    milestoneId: string,
    path: CareerPath
  ): boolean {
    const milestone = path.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    for (const prereq of milestone.prerequisites) {
      if (prereq.type === 'MILESTONE') {
        const prereqMilestone = path.milestones.find(m =>
          m.name.toLowerCase().includes(prereq.description.toLowerCase())
        );
        if (prereqMilestone && prereqMilestone.status !== MilestoneStatus.COMPLETED) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get milestone at risk (likely to fail)
   */
  getMilestonesAtRisk(path: CareerPath): Milestone[] {
    return path.milestones.filter(m =>
      m.failureProbability > 0.5 &&
      (m.status === MilestoneStatus.NOT_STARTED || m.status === MilestoneStatus.IN_PROGRESS)
    );
  }

  /**
   * Calculate path velocity (progress rate)
   */
  calculatePathVelocity(path: CareerPath): number {
    const completed = path.milestones.filter(
      m => m.status === MilestoneStatus.COMPLETED
    ).length;

    if (completed === 0) return 0;

    const totalExpectedDuration = path.milestones
      .filter(m => m.status === MilestoneStatus.COMPLETED)
      .reduce((sum, m) => sum + m.expectedDuration, 0);

    const actualDuration = path.milestones
      .filter(m => m.status === MilestoneStatus.COMPLETED && m.actualDuration)
      .reduce((sum, m) => sum + (m.actualDuration || 0), 0);

    if (actualDuration === 0) return 1;

    return totalExpectedDuration / actualDuration;
  }

  /**
   * Predict path completion
   */
  predictCompletion(
    path: CareerPath
  ): {
    estimatedCompletion: number;
    confidence: number;
    riskFactors: string[];
  } {
    const velocity = this.calculatePathVelocity(path);
    const atRiskMilestones = this.getMilestonesAtRisk(path);
    const remainingMilestones = path.milestones.filter(
      m => m.status !== MilestoneStatus.COMPLETED
    );

    const baseDuration = remainingMilestones.reduce(
      (sum, m) => sum + m.expectedDuration,
      0
    );

    // Adjust for velocity
    const adjustedDuration = velocity > 0
      ? baseDuration / velocity
      : baseDuration;

    // Adjust for risk
    const riskAdjustment = atRiskMilestones.length * 0.1;
    const estimatedCompletion = adjustedDuration * (1 + riskAdjustment);

    // Calculate confidence
    const completionRate = path.milestones.filter(
      m => m.status === MilestoneStatus.COMPLETED
    ).length / path.milestones.length;

    const confidence = Math.max(0, Math.min(1,
      0.5 + (completionRate * 0.3) - (atRiskMilestones.length * 0.1)
    ));

    // Identify risk factors
    const riskFactors: string[] = [];
    if (atRiskMilestones.length > 0) {
      riskFactors.push(`${atRiskMilestones.length} milestones at risk of failure`);
    }
    if (velocity < 0.8) {
      riskFactors.push('Path velocity below expected rate');
    }

    return {
      estimatedCompletion,
      confidence,
      riskFactors,
    };
  }

  /**
   * Format milestone for display
   */
  formatMilestone(milestone: Milestone): string {
    const duration = `${milestone.expectedDuration} months`;
    const status = milestone.status;
    const progress = this.calculateProgress(milestone);

    return `${milestone.name} (${duration}) - ${status} ${progress > 0 ? `(${progress}%)` : ''}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MilestoneEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function
 */
export function createMilestoneEngine(
  config?: Partial<MilestoneEngineConfig>
): MilestoneEngine {
  return new MilestoneEngine(config);
}
