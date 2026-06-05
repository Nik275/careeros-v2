/**
 * CareerOS - Work Environment Engine
 *
 * Models work environment characteristics:
 * - Autonomy
 * - Structure
 * - Bureaucracy
 * - Ownership
 * - Competition
 * - Politics
 * - Flexibility
 *
 * @module work-environment-engine
 * @version 1.0.0
 */

import type {
  WorkEnvironmentProfile,
  AutonomyProfile,
  StructureProfile,
  BureaucracyProfile,
  OwnershipProfile,
  CompetitionProfile,
  PoliticsProfile,
  FlexibilityProfile,
  PhysicalEnvironmentProfile,
  WorkArrangement,
  CompanyStage,
  CareerId,
} from '../types/career-reality-types';

/** Input for work environment modeling */
export interface WorkEnvironmentInput {
  careerId: CareerId;
  careerTitle: string;
  companyStage?: CompanyStage;
  industry?: string;
  experienceLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE';
}

/** Environment characteristics template */
interface EnvironmentTemplate {
  autonomy: number;
  structure: number;
  bureaucracy: number;
  ownership: number;
  competition: number;
  politics: number;
  flexibility: number;
  physical: {
    officeType: PhysicalEnvironmentProfile['officeType'];
    noiseLevel: number;
    commuteMinutes: number;
    travelRequirements: number;
    remoteFeasibility: number;
  };
}

/** Career environment templates */
const CAREER_TEMPLATES: Record<string, EnvironmentTemplate> = {
  'software-engineer': {
    autonomy: 75,
    structure: 40,
    bureaucracy: 25,
    ownership: 70,
    competition: 50,
    politics: 30,
    flexibility: 80,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 60,
      commuteMinutes: 45,
      travelRequirements: 10,
      remoteFeasibility: 90,
    },
  },
  'product-manager': {
    autonomy: 60,
    structure: 55,
    bureaucracy: 45,
    ownership: 75,
    competition: 60,
    politics: 55,
    flexibility: 65,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 70,
      commuteMinutes: 45,
      travelRequirements: 20,
      remoteFeasibility: 70,
    },
  },
  'investment-banker': {
    autonomy: 40,
    structure: 70,
    bureaucracy: 50,
    ownership: 60,
    competition: 90,
    politics: 70,
    flexibility: 20,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 80,
      commuteMinutes: 30,
      travelRequirements: 30,
      remoteFeasibility: 10,
    },
  },
  'doctor': {
    autonomy: 50,
    structure: 80,
    bureaucracy: 70,
    ownership: 40,
    competition: 40,
    politics: 45,
    flexibility: 30,
    physical: {
      officeType: 'PRIVATE_OFFICES',
      noiseLevel: 50,
      commuteMinutes: 30,
      travelRequirements: 5,
      remoteFeasibility: 5,
    },
  },
  'consultant': {
    autonomy: 65,
    structure: 50,
    bureaucracy: 40,
    ownership: 70,
    competition: 75,
    politics: 50,
    flexibility: 50,
    physical: {
      officeType: 'ACTIVITY_BASED',
      noiseLevel: 65,
      commuteMinutes: 60,
      travelRequirements: 60,
      remoteFeasibility: 40,
    },
  },
  'teacher': {
    autonomy: 45,
    structure: 75,
    bureaucracy: 65,
    ownership: 55,
    competition: 30,
    politics: 40,
    flexibility: 35,
    physical: {
      officeType: 'PRIVATE_OFFICES',
      noiseLevel: 70,
      commuteMinutes: 25,
      travelRequirements: 5,
      remoteFeasibility: 20,
    },
  },
  'sales-representative': {
    autonomy: 70,
    structure: 35,
    bureaucracy: 30,
    ownership: 80,
    competition: 85,
    politics: 40,
    flexibility: 60,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 75,
      commuteMinutes: 40,
      travelRequirements: 40,
      remoteFeasibility: 60,
    },
  },
  'data-scientist': {
    autonomy: 80,
    structure: 35,
    bureaucracy: 30,
    ownership: 65,
    competition: 50,
    politics: 35,
    flexibility: 75,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 55,
      commuteMinutes: 45,
      travelRequirements: 10,
      remoteFeasibility: 85,
    },
  },
  'designer': {
    autonomy: 75,
    structure: 30,
    bureaucracy: 25,
    ownership: 70,
    competition: 55,
    politics: 40,
    flexibility: 70,
    physical: {
      officeType: 'ACTIVITY_BASED',
      noiseLevel: 50,
      commuteMinutes: 40,
      travelRequirements: 10,
      remoteFeasibility: 80,
    },
  },
  'default': {
    autonomy: 55,
    structure: 50,
    bureaucracy: 45,
    ownership: 60,
    competition: 55,
    politics: 50,
    flexibility: 55,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 60,
      commuteMinutes: 40,
      travelRequirements: 15,
      remoteFeasibility: 50,
    },
  },
};

/** Company stage modifiers */
const STAGE_MODIFIERS: Record<CompanyStage, Partial<EnvironmentTemplate>> = {
  STARTUP: {
    autonomy: 20,
    structure: -20,
    bureaucracy: -20,
    ownership: 15,
    competition: 10,
    politics: -10,
    flexibility: 15,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 10,
      commuteMinutes: -5,
      travelRequirements: 0,
      remoteFeasibility: 20,
    },
  },
  GROWTH: {
    autonomy: 10,
    structure: 5,
    bureaucracy: 5,
    ownership: 5,
    competition: 5,
    politics: 5,
    flexibility: 5,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 5,
      commuteMinutes: 0,
      travelRequirements: 0,
      remoteFeasibility: 10,
    },
  },
  MID_SIZED: {
    autonomy: -5,
    structure: 10,
    bureaucracy: 10,
    ownership: -5,
    competition: 0,
    politics: 10,
    flexibility: -5,
    physical: {
      officeType: 'OPEN_PLAN',
      noiseLevel: 0,
      commuteMinutes: 5,
      travelRequirements: 0,
      remoteFeasibility: 0,
    },
  },
  ENTERPRISE: {
    autonomy: -15,
    structure: 20,
    bureaucracy: 25,
    ownership: -10,
    competition: 5,
    politics: 20,
    flexibility: -15,
    physical: {
      officeType: 'CUBICLES',
      noiseLevel: -5,
      commuteMinutes: 10,
      travelRequirements: 5,
      remoteFeasibility: -20,
    },
  },
  GOVERNMENT: {
    autonomy: -25,
    structure: 25,
    bureaucracy: 35,
    ownership: -20,
    competition: -15,
    politics: 15,
    flexibility: -25,
    physical: {
      officeType: 'CUBICLES',
      noiseLevel: -10,
      commuteMinutes: 5,
      travelRequirements: -5,
      remoteFeasibility: -30,
    },
  },
  FAMILY_BUSINESS: {
    autonomy: -10,
    structure: 10,
    bureaucracy: 15,
    ownership: 10,
    competition: -10,
    politics: 25,
    flexibility: -10,
    physical: {
      officeType: 'PRIVATE_OFFICES',
      noiseLevel: -15,
      commuteMinutes: 10,
      travelRequirements: -5,
      remoteFeasibility: -10,
    },
  },
};

/**
 * Work Environment Engine - Models work environment characteristics.
 */
export class WorkEnvironmentEngine {
  /**
   * Generate a work environment profile for a career.
   */
  generateProfile(input: WorkEnvironmentInput): WorkEnvironmentProfile {
    const template = this.getTemplate(input.careerId, input.careerTitle);
    const modified = this.applyModifiers(template, input);

    return {
      autonomy: this.generateAutonomyProfile(modified),
      structure: this.generateStructureProfile(modified),
      bureaucracy: this.generateBureaucracyProfile(modified),
      ownership: this.generateOwnershipProfile(modified),
      competition: this.generateCompetitionProfile(modified),
      politics: this.generatePoliticsProfile(modified),
      flexibility: this.generateFlexibilityProfile(modified),
      physicalEnvironment: this.generatePhysicalEnvironment(modified),
    };
  }

  /**
   * Get the base template for a career.
   */
  private getTemplate(careerId: CareerId, careerTitle: string): EnvironmentTemplate {
    for (const [key, template] of Object.entries(CAREER_TEMPLATES)) {
      if (careerId.toLowerCase().includes(key)) {
        return template;
      }
    }

    for (const [key, template] of Object.entries(CAREER_TEMPLATES)) {
      if (careerTitle.toLowerCase().includes(key.replace('-', ' '))) {
        return template;
      }
    }

    return CAREER_TEMPLATES.default;
  }

  /**
   * Apply modifiers based on company stage.
   */
  private applyModifiers(
    template: EnvironmentTemplate,
    input: WorkEnvironmentInput
  ): EnvironmentTemplate {
    if (!input.companyStage) return template;

    const modifier = STAGE_MODIFIERS[input.companyStage];
    const physicalMod = (modifier.physical || {}) as EnvironmentTemplate['physical'];

    return {
      autonomy: this.clamp(template.autonomy + (modifier.autonomy || 0)),
      structure: this.clamp(template.structure + (modifier.structure || 0)),
      bureaucracy: this.clamp(template.bureaucracy + (modifier.bureaucracy || 0)),
      ownership: this.clamp(template.ownership + (modifier.ownership || 0)),
      competition: this.clamp(template.competition + (modifier.competition || 0)),
      politics: this.clamp(template.politics + (modifier.politics || 0)),
      flexibility: this.clamp(template.flexibility + (modifier.flexibility || 0)),
      physical: {
        officeType: (physicalMod.officeType as EnvironmentTemplate['physical']['officeType']) || template.physical.officeType,
        noiseLevel: this.clamp(template.physical.noiseLevel + (physicalMod.noiseLevel || 0)),
        commuteMinutes: Math.max(
          10,
          template.physical.commuteMinutes + (physicalMod.commuteMinutes || 0)
        ),
        travelRequirements: this.clamp(
          template.physical.travelRequirements + (physicalMod.travelRequirements || 0)
        ),
        remoteFeasibility: this.clamp(
          template.physical.remoteFeasibility + (physicalMod.remoteFeasibility || 0)
        ),
      },
    };
  }

  /**
   * Clamp value to 0-100 range.
   */
  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  /**
   * Generate autonomy profile.
   */
  private generateAutonomyProfile(modified: EnvironmentTemplate): AutonomyProfile {
    const baseAutonomy = modified.autonomy;

    return {
      decisionMaking: this.clamp(baseAutonomy + 5),
      taskAutonomy: this.clamp(baseAutonomy),
      scheduleAutonomy: this.clamp(baseAutonomy - 10),
      methodAutonomy: this.clamp(baseAutonomy + 10),
      overallScore: baseAutonomy,
    };
  }

  /**
   * Generate structure profile.
   */
  private generateStructureProfile(modified: EnvironmentTemplate): StructureProfile {
    const baseStructure = modified.structure;

    return {
      processFormalization: this.clamp(baseStructure + 5),
      hierarchyClarity: this.clamp(baseStructure - 5),
      roleClarity: this.clamp(baseStructure),
      reportingFormality: this.clamp(baseStructure + 10),
      overallScore: baseStructure,
    };
  }

  /**
   * Generate bureaucracy profile.
   */
  private generateBureaucracyProfile(modified: EnvironmentTemplate): BureaucracyProfile {
    const baseBureaucracy = modified.bureaucracy;

    return {
      approvalLayers: this.clamp(baseBureaucracy + 5),
      documentationRequirements: this.clamp(baseBureaucracy - 5),
      policyAdherence: this.clamp(baseBureaucracy),
      redTape: this.clamp(baseBureaucracy + 10),
      overallScore: baseBureaucracy,
    };
  }

  /**
   * Generate ownership profile.
   */
  private generateOwnershipProfile(modified: EnvironmentTemplate): OwnershipProfile {
    const baseOwnership = modified.ownership;

    return {
      endToEndOwnership: this.clamp(baseOwnership + 5),
      accountabilityClarity: this.clamp(baseOwnership - 5),
      resourceControl: this.clamp(baseOwnership - 10),
      impactVisibility: this.clamp(baseOwnership),
      overallScore: baseOwnership,
    };
  }

  /**
   * Generate competition profile.
   */
  private generateCompetitionProfile(modified: EnvironmentTemplate): CompetitionProfile {
    const baseCompetition = modified.competition;

    return {
      internalCompetition: this.clamp(baseCompetition),
      marketCompetition: this.clamp(baseCompetition - 10),
      performanceRanking: this.clamp(baseCompetition + 5),
      promotionCompetition: this.clamp(baseCompetition + 10),
      overallScore: baseCompetition,
    };
  }

  /**
   * Generate politics profile.
   */
  private generatePoliticsProfile(modified: EnvironmentTemplate): PoliticsProfile {
    const basePolitics = modified.politics;

    return {
      organizationalPolitics: this.clamp(basePolitics),
      stakeholderManagement: this.clamp(basePolitics + 10),
      networkingImportance: this.clamp(basePolitics + 5),
      visibilityImportance: this.clamp(basePolitics + 15),
      overallScore: basePolitics,
    };
  }

  /**
   * Generate flexibility profile.
   */
  private generateFlexibilityProfile(modified: EnvironmentTemplate): FlexibilityProfile {
    const baseFlexibility = modified.flexibility;
    const remoteFeasibility = modified.physical.remoteFeasibility;

    const workArrangements: WorkArrangement[] = [];

    if (remoteFeasibility > 70) {
      workArrangements.push({
        type: 'FULLY_REMOTE',
        availability: remoteFeasibility,
        commonality: Math.max(0, remoteFeasibility - 20),
      });
    }

    if (remoteFeasibility > 40) {
      workArrangements.push({
        type: 'HYBRID',
        availability: 90,
        commonality: 70,
      });
    }

    if (baseFlexibility > 50) {
      workArrangements.push({
        type: 'FLEXIBLE_HOURS',
        availability: baseFlexibility,
        commonality: Math.max(0, baseFlexibility - 15),
      });
    }

    return {
      scheduleFlexibility: this.clamp(baseFlexibility + 5),
      locationFlexibility: remoteFeasibility,
      workArrangements,
      overallScore: baseFlexibility,
    };
  }

  /**
   * Generate physical environment profile.
   */
  private generatePhysicalEnvironment(
    modified: EnvironmentTemplate
  ): PhysicalEnvironmentProfile {
    return {
      officeType: modified.physical.officeType,
      noiseLevel: modified.physical.noiseLevel,
      typicalCommuteMinutes: modified.physical.commuteMinutes,
      travelRequirements: modified.physical.travelRequirements,
      remoteFeasibility: modified.physical.remoteFeasibility,
    };
  }

  /**
   * Compare work environment profiles.
   */
  compareProfiles(
    profileA: WorkEnvironmentProfile,
    profileB: WorkEnvironmentProfile
  ): {
    similarity: number;
    differences: string[];
    recommendation: string;
  } {
    const differences: string[] = [];

    // Compare autonomy
    const autonomyDiff = Math.abs(profileA.autonomy.overallScore - profileB.autonomy.overallScore);
    if (autonomyDiff > 15) {
      differences.push(`Autonomy differs by ${autonomyDiff} points`);
    }

    // Compare bureaucracy
    const bureaucracyDiff = Math.abs(
      profileA.bureaucracy.overallScore - profileB.bureaucracy.overallScore
    );
    if (bureaucracyDiff > 15) {
      differences.push(`Bureaucracy differs by ${bureaucracyDiff} points`);
    }

    // Compare flexibility
    const flexibilityDiff = Math.abs(
      profileA.flexibility.overallScore - profileB.flexibility.overallScore
    );
    if (flexibilityDiff > 15) {
      differences.push(`Flexibility differs by ${flexibilityDiff} points`);
    }

    // Compare competition
    const competitionDiff = Math.abs(
      profileA.competition.overallScore - profileB.competition.overallScore
    );
    if (competitionDiff > 15) {
      differences.push(`Competition differs by ${competitionDiff} points`);
    }

    // Calculate similarity
    const similarity = Math.max(
      0,
      100 -
        autonomyDiff * 0.5 -
        bureaucracyDiff * 0.5 -
        flexibilityDiff * 0.5 -
        competitionDiff * 0.5
    );

    // Generate recommendation
    let recommendation = '';
    if (profileA.autonomy.overallScore > profileB.autonomy.overallScore + 15) {
      recommendation = 'Choose Career A if you value autonomy and independence';
    } else if (profileB.autonomy.overallScore > profileA.autonomy.overallScore + 15) {
      recommendation = 'Choose Career B if you value autonomy and independence';
    } else if (profileA.bureaucracy.overallScore < profileB.bureaucracy.overallScore - 15) {
      recommendation = 'Choose Career A if you prefer less bureaucracy';
    } else if (profileB.bureaucracy.overallScore < profileA.bureaucracy.overallScore - 15) {
      recommendation = 'Choose Career B if you prefer less bureaucracy';
    } else if (profileA.flexibility.overallScore > profileB.flexibility.overallScore + 15) {
      recommendation = 'Choose Career A if work-life balance is important';
    } else if (profileB.flexibility.overallScore > profileA.flexibility.overallScore + 15) {
      recommendation = 'Choose Career B if work-life balance is important';
    } else {
      recommendation = 'Both careers offer similar work environment characteristics';
    }

    return { similarity, differences, recommendation };
  }

  /**
   * Get environment archetype.
   */
  getEnvironmentArchetype(profile: WorkEnvironmentProfile): string {
    const { autonomy, bureaucracy, flexibility, competition, structure } = profile;

    if (autonomy.overallScore > 70 && bureaucracy.overallScore < 30) {
      return 'Free Agent Environment';
    }
    if (bureaucracy.overallScore > 70 && structure.overallScore > 70) {
      return 'Structured Corporate Environment';
    }
    if (competition.overallScore > 75 && autonomy.overallScore < 50) {
      return 'High-Pressure Competitive Environment';
    }
    if (flexibility.overallScore > 70 && autonomy.overallScore > 60) {
      return 'Flexible Creative Environment';
    }
    if (bureaucracy.overallScore > 60 && autonomy.overallScore < 40) {
      return 'Bureaucratic Environment';
    }

    return 'Balanced Corporate Environment';
  }
}

/**
 * Factory function for WorkEnvironmentEngine.
 */
export function createWorkEnvironmentEngine(): WorkEnvironmentEngine {
  return new WorkEnvironmentEngine();
}
