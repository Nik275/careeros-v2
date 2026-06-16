/**
 * Evidence Gap Engine
 *
 * Identifies areas where CareerOS lacks evidence and learning.
 * Prioritizes data collection for rare careers, emerging fields,
 * and underrepresented pathways.
 *
 * @module intelligence/active-learning
 * @version 1.0.0
 */

import type {
  StudentId,
} from '../outcome-tracking/outcome-types.js';
import type {
  CareerId,
  EvidenceGap,
  EvidenceGapId,
  EvidenceGapType,
  EvidenceGapAnalysis,
  PriorityLevel,
  ActiveLearningConfig,
  DecisionBoundaryId,
} from './active-learning-types.js';

interface GapTracking {
  samples: StudentId[];
  lastSampleTimestamp: number;
  coverageHistory: { timestamp: number; coverage: number }[];
}

/**
 * Generates unique evidence gap ID
 */
function generateGapId(): EvidenceGapId {
  return `gap-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as EvidenceGapId;
}

/**
 * Predefined evidence gaps
 */
const PREDEFINED_GAPS: Omit<EvidenceGap, 'gapId' | 'currentSamples' | 'coverage'>[] = [
  {
    type: 'RARE_CAREER',
    name: 'Rare Career Paths',
    description: 'Careers with very few practitioners or samples',
    targetSamples: 50,
    priority: 'HIGH',
    relatedCareers: [],
    relatedBoundaries: [],
    learningStrategy: 'Targeted outreach to rare career professionals',
  },
  {
    type: 'EMERGING_CAREER',
    name: 'Emerging Careers',
    description: 'New career paths that have emerged recently',
    targetSamples: 100,
    priority: 'HIGH',
    relatedCareers: [],
    relatedBoundaries: [],
    learningStrategy: 'Early adopter tracking and trend analysis',
  },
  {
    type: 'CREATOR_ECONOMY',
    name: 'Creator Economy',
    description: 'Content creators, influencers, and independent digital entrepreneurs',
    targetSamples: 150,
    priority: 'MEDIUM',
    relatedCareers: [],
    relatedBoundaries: ['creator-employee' as DecisionBoundaryId],
    learningStrategy: 'Social media and platform-based recruitment',
  },
  {
    type: 'AI_CAREER',
    name: 'AI-Related Careers',
    description: 'Careers in AI development, ethics, policy, and implementation',
    targetSamples: 200,
    priority: 'HIGH',
    relatedCareers: [],
    relatedBoundaries: [],
    learningStrategy: 'Tech industry partnerships and academic collaboration',
  },
  {
    type: 'NEW_INDUSTRY',
    name: 'New Industries',
    description: 'Industries that have formed in the last 5-10 years',
    targetSamples: 120,
    priority: 'MEDIUM',
    relatedCareers: [],
    relatedBoundaries: [],
    learningStrategy: 'Industry-specific surveys and interviews',
  },
  {
    type: 'GEOGRAPHIC_REGION',
    name: 'Underrepresented Regions',
    description: 'Career data from underrepresented geographic areas',
    targetSamples: 100,
    priority: 'MEDIUM',
    relatedCareers: [],
    relatedBoundaries: ['local-global' as DecisionBoundaryId],
    learningStrategy: 'Regional partnerships and localized outreach',
  },
  {
    type: 'DEMOGRAPHIC_SEGMENT',
    name: 'Demographic Segments',
    description: 'Underrepresented demographic groups in career data',
    targetSamples: 200,
    priority: 'HIGH',
    relatedCareers: [],
    relatedBoundaries: [],
    learningStrategy: 'Inclusive sampling and community partnerships',
  },
  {
    type: 'EDUCATION_PATHWAY',
    name: 'Alternative Education',
    description: 'Non-traditional education and training pathways',
    targetSamples: 150,
    priority: 'MEDIUM',
    relatedCareers: [],
    relatedBoundaries: [],
    learningStrategy: 'Bootcamp and alternative education partnerships',
  },
  {
    type: 'TRANSITION_TYPE',
    name: 'Career Transitions',
    description: 'Major career change patterns and outcomes',
    targetSamples: 180,
    priority: 'HIGH',
    relatedCareers: [],
    relatedBoundaries: ['career-domain-tech-creative' as DecisionBoundaryId, 'career-domain-corporate-startup' as DecisionBoundaryId],
    learningStrategy: 'Longitudinal tracking of career changers',
  },
  {
    type: 'DECISION_PATTERN',
    name: 'Complex Decision Patterns',
    description: 'Students facing multiple simultaneous career decisions',
    targetSamples: 100,
    priority: 'MEDIUM',
    relatedCareers: [],
    relatedBoundaries: ['career-domain-tech-creative' as DecisionBoundaryId, 'career-domain-corporate-startup' as DecisionBoundaryId, 'risk-tolerance-high-low' as DecisionBoundaryId],
    learningStrategy: 'Multi-boundary student deep-dive analysis',
  },
];

/**
 * Evidence Gap Engine - Identifies knowledge gaps
 */
export class EvidenceGapEngine {
  private gaps: Map<EvidenceGapId, EvidenceGap> = new Map();
  private gapTracking: Map<EvidenceGapId, GapTracking> = new Map();
  private studentGaps: Map<StudentId, EvidenceGapId[]> = new Map();
  private config: ActiveLearningConfig;

  constructor(config: ActiveLearningConfig) {
    this.config = config;
    this.initializePredefinedGaps();
  }

  /**
   * Initialize predefined gaps
   */
  private initializePredefinedGaps(): void {
    for (const gapTemplate of PREDEFINED_GAPS) {
      const gap: EvidenceGap = {
        ...gapTemplate,
        gapId: generateGapId(),
        currentSamples: 0,
        coverage: 0,
      };
      this.gaps.set(gap.gapId, gap);
      this.gapTracking.set(gap.gapId, {
        samples: [],
        lastSampleTimestamp: 0,
        coverageHistory: [],
      });
    }
  }

  /**
   * Identify all evidence gaps
   */
  identifyGaps(): EvidenceGap[] {
    return Array.from(this.gaps.values());
  }

  /**
   * Get critical gaps (low coverage, high priority)
   */
  getCriticalGaps(): EvidenceGap[] {
    const criticalThreshold = this.config.evidenceGap.criticalCoverageThreshold;

    return Array.from(this.gaps.values())
      .filter(gap => 
        gap.coverage < criticalThreshold && 
        (gap.priority === 'HIGH' || gap.priority === 'MEDIUM')
      )
      .sort((a, b) => {
        // Sort by priority then coverage
        if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
        if (b.priority === 'HIGH' && a.priority !== 'HIGH') return -1;
        return a.coverage - b.coverage;
      });
  }

  /**
   * Update gap coverage with new samples
   */
  updateGapCoverage(gapId: EvidenceGapId, newSamples: number): void {
    const gap = this.gaps.get(gapId);
    const tracking = this.gapTracking.get(gapId);

    if (!gap || !tracking) return;

    gap.currentSamples += newSamples;
    gap.coverage = Math.min(100, (gap.currentSamples / gap.targetSamples) * 100);

    tracking.lastSampleTimestamp = Date.now();
    tracking.coverageHistory.push({
      timestamp: Date.now(),
      coverage: gap.coverage,
    });

    // Update priority based on coverage
    if (gap.coverage >= this.config.evidenceGap.targetCoverage) {
      gap.priority = 'LOW';
    } else if (gap.coverage < this.config.evidenceGap.criticalCoverageThreshold) {
      gap.priority = 'HIGH';
    } else {
      gap.priority = 'MEDIUM';
    }
  }

  /**
   * Add student sample to gap
   */
  addSampleToGap(gapId: EvidenceGapId, studentId: StudentId): void {
    const tracking = this.gapTracking.get(gapId);
    if (!tracking) return;

    if (!tracking.samples.includes(studentId)) {
      tracking.samples.push(studentId);
      this.updateGapCoverage(gapId, 1);

      // Track which gaps this student fills
      const studentGapList = this.studentGaps.get(studentId) || [];
      if (!studentGapList.includes(gapId)) {
        studentGapList.push(gapId);
        this.studentGaps.set(studentId, studentGapList);
      }
    }
  }

  /**
   * Get gaps filled by a student
   */
  getStudentGaps(studentId: StudentId): EvidenceGap[] {
    const gapIds = this.studentGaps.get(studentId) || [];
    return gapIds
      .map(id => this.gaps.get(id))
      .filter((gap): gap is EvidenceGap => gap !== undefined);
  }

  /**
   * Get recommended sampling targets
   */
  getRecommendedSamplingTargets(): { gapId: EvidenceGapId; targetStudents: StudentId[] }[] {
    const targets: { gapId: EvidenceGapId; targetStudents: StudentId[] }[] = [];

    for (const [gapId, tracking] of this.gapTracking) {
      const gap = this.gaps.get(gapId);
      if (!gap) continue;

      // Calculate how many more samples needed
      const samplesNeeded = Math.max(0, gap.targetSamples - gap.currentSamples);

      if (samplesNeeded > 0 && gap.priority !== 'LOW') {
        targets.push({
          gapId,
          targetStudents: tracking.samples.slice(-Math.min(samplesNeeded, 10)),
        });
      }
    }

    return targets;
  }

  /**
   * Get gaps by type
   */
  getGapsByType(type: EvidenceGapType): EvidenceGap[] {
    return Array.from(this.gaps.values()).filter(gap => gap.type === type);
  }

  /**
   * Get gap by ID
   */
  getGap(gapId: EvidenceGapId): EvidenceGap | undefined {
    return this.gaps.get(gapId);
  }

  /**
   * Get gap statistics
   */
  getStats(): {
    totalGaps: number;
    criticalGaps: number;
    totalSamples: number;
    averageCoverage: number;
    totalTargetSamples: number;
  } {
    let criticalCount = 0;
    let totalSamples = 0;
    let totalCoverage = 0;
    let totalTargets = 0;

    for (const gap of this.gaps.values()) {
      if (gap.coverage < this.config.evidenceGap.criticalCoverageThreshold) {
        criticalCount++;
      }
      totalSamples += gap.currentSamples;
      totalCoverage += gap.coverage;
      totalTargets += gap.targetSamples;
    }

    const totalGaps = this.gaps.size;

    return {
      totalGaps,
      criticalGaps: criticalCount,
      totalSamples,
      averageCoverage: totalGaps > 0 ? totalCoverage / totalGaps : 0,
      totalTargetSamples: totalTargets,
    };
  }

  /**
   * Generate comprehensive gap analysis
   */
  generateAnalysis(): EvidenceGapAnalysis {
    const gaps = Array.from(this.gaps.values());
    const criticalGaps = this.getCriticalGaps();

    // Calculate progress
    const gapProgress = gaps.map(gap => {
      const tracking = this.gapTracking.get(gap.gapId);
      const coverageHistory = tracking?.coverageHistory ?? [];
      const previousCoverage = coverageHistory.length > 1
        ? coverageHistory[coverageHistory.length - 2].coverage
        : 0;

      return {
        gapId: gap.gapId,
        previousCoverage,
        currentCoverage: gap.coverage,
      };
    });

    // Calculate estimated impact
    const estimatedImpact = criticalGaps.reduce((sum, gap) => {
      const coverageNeeded = this.config.evidenceGap.targetCoverage - gap.coverage;
      return sum + (coverageNeeded * 0.5); // Each % coverage = 0.5% improvement
    }, 0);

    return {
      analysisId: `analysis-${Date.now()}`,
      timestamp: Date.now(),
      gaps,
      criticalGaps: criticalGaps.map(g => g.gapId),
      gapProgress,
      recommendedFocus: criticalGaps.slice(0, 3).map(g => g.gapId),
      estimatedImpact: Math.min(100, estimatedImpact),
    };
  }

  /**
   * Register a new evidence gap
   */
  registerGap(
    type: EvidenceGapType,
    name: string,
    description: string,
    targetSamples: number,
    priority: PriorityLevel,
    relatedCareers: CareerId[] = [],
    relatedBoundaries: DecisionBoundaryId[] = [],
    learningStrategy: string = ''
  ): EvidenceGapId {
    const gapId = generateGapId();
    const gap: EvidenceGap = {
      gapId,
      type,
      name,
      description,
      currentSamples: 0,
      targetSamples,
      coverage: 0,
      priority,
      relatedCareers,
      relatedBoundaries,
      learningStrategy,
    };

    this.gaps.set(gapId, gap);
    this.gapTracking.set(gapId, {
      samples: [],
      lastSampleTimestamp: 0,
      coverageHistory: [],
    });

    return gapId;
  }

  /**
   * Check if student fills any evidence gaps
   */
  studentFillsGap(studentId: StudentId): boolean {
    const gaps = this.studentGaps.get(studentId);
    return gaps !== undefined && gaps.length > 0;
  }

  /**
   * Get gap coverage for a specific gap
   */
  getGapCoverage(gapId: EvidenceGapId): number {
    return this.gaps.get(gapId)?.coverage || 0;
  }

  /**
   * Get sample count for a gap
   */
  getSampleCount(gapId: EvidenceGapId): number {
    const tracking = this.gapTracking.get(gapId);
    return tracking?.samples.length || 0;
  }

  /**
   * Get students who fill a specific gap
   */
  getGapStudents(gapId: EvidenceGapId): StudentId[] {
    const tracking = this.gapTracking.get(gapId);
    return tracking?.samples || [];
  }

  /**
   * Get gaps sorted by learning value
   */
  getGapsByLearningValue(): EvidenceGap[] {
    return Array.from(this.gaps.values())
      .sort((a, b) => {
        // Higher priority gaps with lower coverage = higher learning value
        const aValue = (a.priority === 'HIGH' ? 3 : a.priority === 'MEDIUM' ? 2 : 1) * (100 - a.coverage);
        const bValue = (b.priority === 'HIGH' ? 3 : b.priority === 'MEDIUM' ? 2 : 1) * (100 - b.coverage);
        return bValue - aValue;
      });
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.gaps.clear();
    this.gapTracking.clear();
    this.studentGaps.clear();
    this.initializePredefinedGaps();
  }

  /**
   * Get gaps related to a career
   */
  getGapsForCareer(careerId: CareerId): EvidenceGap[] {
    return Array.from(this.gaps.values()).filter(gap =>
      gap.relatedCareers.includes(careerId)
    );
  }

  /**
   * Get gaps related to a boundary
   */
  getGapsForBoundary(boundaryId: DecisionBoundaryId): EvidenceGap[] {
    return Array.from(this.gaps.values()).filter(gap =>
      gap.relatedBoundaries.includes(boundaryId)
    );
  }
}

export default EvidenceGapEngine;
