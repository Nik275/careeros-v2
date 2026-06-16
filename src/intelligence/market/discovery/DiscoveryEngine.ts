/**
 * CareerOS Market Intelligence - Discovery Engine
 *
 * Main orchestrator for market discovery.
 * Coordinates all discovery engines and provides unified discovery interface.
 *
 * Purpose:
 * - Detect changes in the labor market
 * - Identify emerging careers, skills, and industries
 * - Identify declining careers and skills
 * - Route discoveries to review pipeline
 *
 * This system DISCOVERS. It does NOT automatically publish.
 * All discoveries enter a review pipeline. Human review required.
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { EmergingCareer } from './models/EmergingCareer';
import type { EmergingSkill } from './models/EmergingSkill';
import type { EmergingIndustry } from './models/EmergingIndustry';
import type { DecliningCareer } from './models/DecliningCareer';
import type { DecliningSkill } from './DecliningSkillEngine';
import type { DiscoveryAnalysis } from './models/DiscoveryAnalysis';
import { CareerDiscoveryEngine, createCareerDiscoveryEngine } from './CareerDiscoveryEngine';
import { SkillDiscoveryEngine, createSkillDiscoveryEngine } from './SkillDiscoveryEngine';
import { IndustryDiscoveryEngine, createIndustryDiscoveryEngine } from './IndustryDiscoveryEngine';
import { DecliningCareerEngine, createDecliningCareerEngine } from './DecliningCareerEngine';
import { DecliningSkillEngine, createDecliningSkillEngine } from './DecliningSkillEngine';

/**
 * Discovery engine configuration.
 */
export interface DiscoveryEngineConfig {
  /** Enable career discovery */
  enableCareerDiscovery: boolean;

  /** Enable skill discovery */
  enableSkillDiscovery: boolean;

  /** Enable industry discovery */
  enableIndustryDiscovery: boolean;

  /** Enable declining career detection */
  enableDecliningCareerDetection: boolean;

  /** Enable declining skill detection */
  enableDecliningSkillDetection: boolean;

  /** Auto-process signals */
  autoProcess: boolean;

  /** Minimum confidence for discovery */
  minConfidence: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_DISCOVERY_CONFIG: DiscoveryEngineConfig = {
  enableCareerDiscovery: true,
  enableSkillDiscovery: true,
  enableIndustryDiscovery: true,
  enableDecliningCareerDetection: true,
  enableDecliningSkillDetection: true,
  autoProcess: true,
  minConfidence: 50,
};

/**
 * Discovery result.
 */
export interface DiscoveryResult {
  /** Timestamp */
  timestamp: Date;

  /** New emerging careers */
  newCareers: EmergingCareer[];

  /** New emerging skills */
  newSkills: EmergingSkill[];

  /** New emerging industries */
  newIndustries: EmergingIndustry[];

  /** New declining careers */
  newDecliningCareers: DecliningCareer[];

  /** New declining skills */
  newDecliningSkills: DecliningSkill[];

  /** All analyses */
  analyses: DiscoveryAnalysis[];

  /** Discovery summary */
  summary: {
    totalDiscoveries: number;
    careerDiscoveries: number;
    skillDiscoveries: number;
    industryDiscoveries: number;
    decliningDiscoveries: number;
  };
}

/**
 * Discovery statistics.
 */
export interface DiscoveryStatistics {
  /** Total discoveries by type */
  totals: {
    careers: number;
    skills: number;
    industries: number;
    decliningCareers: number;
    decliningSkills: number;
  };

  /** Pending review counts */
  pendingReview: {
    careers: number;
    skills: number;
    industries: number;
  };

  /** Approved counts */
  approved: {
    careers: number;
    skills: number;
    industries: number;
  };

  /** Rejected counts */
  rejected: {
    careers: number;
    skills: number;
    industries: number;
  };

  /** Average confidence by type */
  averageConfidence: {
    careers: number;
    skills: number;
    industries: number;
  };
}

/**
 * Main discovery orchestrator.
 */
export class DiscoveryEngine {
  private config: DiscoveryEngineConfig;

  // Domain discovery engines
  private careerDiscovery: CareerDiscoveryEngine;
  private skillDiscovery: SkillDiscoveryEngine;
  private industryDiscovery: IndustryDiscoveryEngine;
  private decliningCareerEngine: DecliningCareerEngine;
  private decliningSkillEngine: DecliningSkillEngine;

  // Signal buffer for batch processing
  private signalBuffer: DiscoverySignal[] = [];

  constructor(config?: Partial<DiscoveryEngineConfig>) {
    this.config = { ...DEFAULT_DISCOVERY_CONFIG, ...config };

    // Initialize engines
    this.careerDiscovery = createCareerDiscoveryEngine();
    this.skillDiscovery = createSkillDiscoveryEngine();
    this.industryDiscovery = createIndustryDiscoveryEngine();
    this.decliningCareerEngine = createDecliningCareerEngine();
    this.decliningSkillEngine = createDecliningSkillEngine();
  }

  /**
   * Process discovery signals and run discovery.
   */
  discover(signals: DiscoverySignal[]): DiscoveryResult {
    const newCareers: EmergingCareer[] = [];
    const newSkills: EmergingSkill[] = [];
    const newIndustries: EmergingIndustry[] = [];
    const newDecliningCareers: DecliningCareer[] = [];
    const newDecliningSkills: DecliningSkill[] = [];
    const analyses: DiscoveryAnalysis[] = [];

    // Distribute signals to appropriate engines
    for (const signal of signals) {
      this.routeSignal(signal);
    }

    // Run career discovery
    if (this.config.enableCareerDiscovery) {
      const careerResult = this.careerDiscovery.discover(signals);
      newCareers.push(...careerResult.newDiscoveries);
      analyses.push(...careerResult.analyses);
    }

    // Run skill discovery
    if (this.config.enableSkillDiscovery) {
      const skillResult = this.skillDiscovery.discover(signals);
      newSkills.push(...skillResult.newDiscoveries);
      analyses.push(...skillResult.analyses);
    }

    // Run industry discovery
    if (this.config.enableIndustryDiscovery) {
      const industryResult = this.industryDiscovery.discover(signals);
      newIndustries.push(...industryResult.newDiscoveries);
      analyses.push(...industryResult.analyses);
    }

    // Run declining career detection
    if (this.config.enableDecliningCareerDetection) {
      const decliningCareerResults = this.decliningCareerEngine.processSignals(signals);
      for (const result of decliningCareerResults) {
        if (result.isValid) {
          newDecliningCareers.push(result.career);
        }
      }
    }

    // Run declining skill detection
    if (this.config.enableDecliningSkillDetection) {
      const decliningSkillResults = this.decliningSkillEngine.processSignals(signals);
      for (const result of decliningSkillResults) {
        if (result.isValid) {
          newDecliningSkills.push(result.skill);
        }
      }
    }

    return {
      timestamp: new Date(),
      newCareers,
      newSkills,
      newIndustries,
      newDecliningCareers,
      newDecliningSkills,
      analyses,
      summary: {
        totalDiscoveries:
          newCareers.length +
          newSkills.length +
          newIndustries.length +
          newDecliningCareers.length +
          newDecliningSkills.length,
        careerDiscoveries: newCareers.length,
        skillDiscoveries: newSkills.length,
        industryDiscoveries: newIndustries.length,
        decliningDiscoveries: newDecliningCareers.length + newDecliningSkills.length,
      },
    };
  }

  /**
   * Add single signal.
   */
  addSignal(signal: DiscoverySignal): void {
    if (this.config.autoProcess) {
      // Route immediately
      this.routeSignal(signal);
    } else {
      // Buffer for batch processing
      this.signalBuffer.push(signal);
    }
  }

  /**
   * Process buffered signals.
   */
  processBuffer(): DiscoveryResult {
    const result = this.discover(this.signalBuffer);
    this.signalBuffer = [];
    return result;
  }

  /**
   * Get all discoveries.
   */
  getAllDiscoveries(): {
    careers: EmergingCareer[];
    skills: EmergingSkill[];
    industries: EmergingIndustry[];
    decliningCareers: DecliningCareer[];
    decliningSkills: DecliningSkill[];
  } {
    return {
      careers: this.careerDiscovery.getAllCareers(),
      skills: this.skillDiscovery.getAllSkills(),
      industries: this.industryDiscovery.getAllIndustries(),
      decliningCareers: this.decliningCareerEngine.getAllCareers(),
      decliningSkills: this.decliningSkillEngine.getAllSkills(),
    };
  }

  /**
   * Get discoveries awaiting review.
   */
  getPendingReview(): {
    careers: ReturnType<CareerDiscoveryEngine['getPendingReview']>;
    skills: ReturnType<SkillDiscoveryEngine['getPendingReview']>;
    industries: ReturnType<IndustryDiscoveryEngine['getPendingReview']>;
  } {
    return {
      careers: this.careerDiscovery.getPendingReview(),
      skills: this.skillDiscovery.getPendingReview(),
      industries: this.industryDiscovery.getPendingReview(),
    };
  }

  /**
   * Approve a discovery.
   */
  approveDiscovery(
    type: 'career' | 'skill' | 'industry',
    id: string,
    notes?: string
  ): boolean {
    switch (type) {
      case 'career':
        return this.careerDiscovery.approveCareer(id, notes);
      case 'skill':
        return this.skillDiscovery.approveSkill(id, notes);
      case 'industry':
        return this.industryDiscovery.approveIndustry(id, notes);
      default:
        return false;
    }
  }

  /**
   * Reject a discovery.
   */
  rejectDiscovery(
    type: 'career' | 'skill' | 'industry',
    id: string,
    reason: string
  ): boolean {
    switch (type) {
      case 'career':
        return this.careerDiscovery.rejectCareer(id, reason);
      case 'skill':
        return this.skillDiscovery.rejectSkill(id, reason);
      case 'industry':
        return this.industryDiscovery.rejectIndustry(id, reason);
      default:
        return false;
    }
  }

  /**
   * Get discovery statistics.
   */
  getStatistics(): DiscoveryStatistics {
    const careerStats = this.careerDiscovery.getStatistics();
    const skillStats = this.skillDiscovery.getStatistics();
    const industryStats = this.industryDiscovery.getStatistics();

    return {
      totals: {
        careers: careerStats.totalDiscovered,
        skills: skillStats.totalDiscovered,
        industries: industryStats.totalDiscovered,
        decliningCareers: this.decliningCareerEngine.getAllCareers().length,
        decliningSkills: this.decliningSkillEngine.getAllSkills().length,
      },
      pendingReview: {
        careers: careerStats.pendingReview,
        skills: skillStats.pendingReview,
        industries: industryStats.pendingReview,
      },
      approved: {
        careers: careerStats.approved,
        skills: skillStats.approved,
        industries: industryStats.approved,
      },
      rejected: {
        careers: careerStats.rejected,
        skills: skillStats.rejected,
        industries: industryStats.rejected,
      },
      averageConfidence: {
        careers: careerStats.averageConfidence,
        skills: skillStats.averageConfidence,
        industries: industryStats.averageConfidence,
      },
    };
  }

  /**
   * Get top emerging opportunities.
   */
  getTopOpportunities(count: number = 10): {
    careers: EmergingCareer[];
    skills: EmergingSkill[];
    industries: EmergingIndustry[];
  } {
    const allCareers = this.careerDiscovery.getAllCareers();
    const allSkills = this.skillDiscovery.getAllSkills();
    const allIndustries = this.industryDiscovery.getAllIndustries();

    // Sort by confidence and growth
    const sortedCareers = allCareers.sort((a, b) => b.confidence - a.confidence);
    const sortedSkills = allSkills.sort((a, b) => b.confidence - a.confidence);
    const sortedIndustries = allIndustries.sort((a, b) => b.confidence - a.confidence);

    return {
      careers: sortedCareers.slice(0, count),
      skills: sortedSkills.slice(0, count),
      industries: sortedIndustries.slice(0, count),
    };
  }

  /**
   * Get decline alerts.
   */
  getDeclineAlerts(minUrgency: number = 60): {
    careers: ReturnType<DecliningCareerEngine['getAlerts']>;
    skills: DecliningSkill[];
  } {
    return {
      careers: this.decliningCareerEngine.getAlerts(minUrgency),
      skills: this.decliningSkillEngine.getHighPriority(minUrgency),
    };
  }

  /**
   * Search discoveries.
   */
  search(query: string): {
    careers: EmergingCareer[];
    skills: EmergingSkill[];
    industries: EmergingIndustry[];
  } {
    const lowerQuery = query.toLowerCase();

    return {
      careers: this.careerDiscovery
        .getAllCareers()
        .filter(
          (c) =>
            c.title.toLowerCase().includes(lowerQuery) ||
            c.alternativeTitles.some((t) => t.toLowerCase().includes(lowerQuery))
        ),
      skills: this.skillDiscovery
        .getAllSkills()
        .filter(
          (s) =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.alternativeNames.some((n) => n.toLowerCase().includes(lowerQuery))
        ),
      industries: this.industryDiscovery
        .getAllIndustries()
        .filter(
          (i) =>
            i.name.toLowerCase().includes(lowerQuery) ||
            i.alternativeNames.some((n) => n.toLowerCase().includes(lowerQuery))
        ),
    };
  }

  /**
   * Route signal to appropriate engine.
   */
  private routeSignal(signal: DiscoverySignal): void {
    switch (signal.targetEntity.type) {
      case 'career':
        this.careerDiscovery.addSignal(signal);
        this.decliningCareerEngine.addSignal(signal);
        break;
      case 'skill':
        this.skillDiscovery.addSignal(signal);
        this.decliningSkillEngine.addSignal(signal);
        break;
      case 'industry':
        this.industryDiscovery.addSignal(signal);
        break;
    }
  }
}

/**
 * Factory function for DiscoveryEngine.
 */
export function createDiscoveryEngine(config?: Partial<DiscoveryEngineConfig>): DiscoveryEngine {
  return new DiscoveryEngine(config);
}
