/**
 * CareerOS Explainability Engine
 *
 * CareerOS - Career Intelligence System
 *
 * Generates world-class career counselor explanations for career recommendations.
 * Every explanation is dynamically generated from data - no templates, no generic text.
 *
 * Philosophy:
 *   - Think like an expert career counselor with 20+ years of experience
 *   - Speak directly to the student with empathy and insight
 *   - Highlight what matters, not what's obvious
 *   - Be honest about tradeoffs and risks
 *   - Connect the dots between who they are and what the career demands
 *
 * Output Quality Standards:
 *   - Specific: References actual trait scores and concrete differences
 *   - Contextual: Considers the student's unique situation
 *   - Actionable: Points out what to explore or verify
 *   - Honest: Doesn't oversell mismatches
 *   - Human: Natural language, not robotic bullet points
 */

import type { Career, PsychologicalProfile, WorkStyleProfile, RewardProfile, RiskProfile } from '../../domains/career/Career';
import type { StudentProfile, PsychologyProfile as StudentPsychology, Motivations, RealityConstraints } from '../../domains/student/StudentProfile';
import type { CareerMatch, MatchExplanation, TraitMatch, MotivationMatch, ConstraintResult } from '../matching-engine/MatchingEngineV1';

// ============================================================================
// EXPLAINABILITY TYPES
// ============================================================================

/**
 * Rich explanation for a career match.
 */
export interface CareerExplanation {
  /** Executive summary - the "elevator pitch" */
  summary: string;

  /** Why this career fits the student specifically */
  whyThisCareer: string;

  /** Psychological alignment deep dive */
  psychology: PsychologicalExplanation;

  /** Motivation alignment deep dive */
  motivations: MotivationExplanation;

  /** Work style compatibility */
  workStyle: WorkStyleExplanation;

  /** Reality constraints assessment */
  constraints: ConstraintsExplanation;

  /** Key strengths for this career */
  strengths: StrengthsExplanation;

  /** Risks and challenges */
  risks: RisksExplanation;

  /** Tradeoffs to consider */
  tradeoffs: TradeoffsExplanation;

  /** Counselor's recommendation */
  recommendation: RecommendationExplanation;

  /** Next steps to explore */
  nextSteps: string[];

  /** Questions to reflect on */
  reflectionQuestions: string[];

  /** Metadata */
  metadata: {
    overallScore: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    dataQuality: 'complete' | 'partial' | 'minimal';
    generationTimestamp: number;
  };
}

export interface PsychologicalExplanation {
  /** Overall assessment */
  assessment: string;

  /** Natural strengths - where student exceeds career requirements */
  naturalStrengths: TraitExplanation[];

  /** Growth areas - where career demands more than student has */
  growthAreas: TraitExplanation[];

  /** Core alignment - the fundamental personality fit */
  coreAlignment: string;

  /** Potential friction points */
  frictionPoints: string[];
}

export interface TraitExplanation {
  trait: string;
  studentScore: number;
  careerRequirement: number;
  explanation: string;
  impact: 'high' | 'medium' | 'low';
}

export interface MotivationExplanation {
  /** Overall assessment */
  assessment: string;

  /** What this career will give them */
  willSatisfy: MotivationSatisfaction[];

  /** What might be missing */
  potentialGaps: MotivationGap[];

  /** Career's reward profile described in their terms */
  rewardDescription: string;
}

export interface MotivationSatisfaction {
  motivation: string;
  importanceToStudent: number;
  careerDelivery: number;
  explanation: string;
}

export interface MotivationGap {
  motivation: string;
  importanceToStudent: number;
  careerDelivery: number;
  explanation: string;
  mitigation?: string;
}

export interface WorkStyleExplanation {
  /** Overall fit */
  assessment: string;

  /** Day-to-day reality description */
  dayToDayReality: string;

  /** Lifestyle implications */
  lifestyleImplications: string;

  /** What they'll love */
  positiveAspects: string[];

  /** What might challenge them */
  challengingAspects: string[];
}

export interface ConstraintsExplanation {
  /** Overall feasibility */
  feasibility: 'straightforward' | 'manageable' | 'challenging' | 'significant-barriers';

  /** Assessment summary */
  summary: string;

  /** Specific constraints */
  specificConstraints: SpecificConstraint[];

  /** Path forward despite constraints */
  pathForward: string;
}

export interface SpecificConstraint {
  constraint: string;
  status: 'satisfied' | 'minor-issue' | 'significant-challenge';
  explanation: string;
  actionableAdvice?: string;
}

export interface StrengthsExplanation {
  /** Why they'll succeed */
  successFactors: string[];

  /** Natural advantages */
  naturalAdvantages: string[];

  /** How they stand out */
  competitiveEdge: string;
}

export interface RisksExplanation {
  /** Main risks */
  primaryRisks: RiskDetail[];

  /** Risk mitigation strategies */
  mitigation: string[];

  /** Honest assessment */
  realityCheck: string;
}

export interface RiskDetail {
  risk: string;
  level: 'high' | 'medium' | 'low';
  explanation: string;
  probability: 'likely' | 'possible' | 'unlikely';
}

export interface TradeoffsExplanation {
  /** What they gain */
  gains: string[];

  /** What they give up */
  sacrifices: string[];

  /** The central tradeoff */
  centralTradeoff: string;

  /** Comparison to alternatives */
  comparedToAlternatives: string;
}

export interface RecommendationExplanation {
  /** Bottom line */
  verdict: 'strong-recommend' | 'recommend' | 'consider' | 'proceed-with-caution' | 'not-recommended';

  /** Who this is for */
  idealFor: string;

  /** Who should think twice */
  thinkTwiceIf: string;

  /** Final counselor note */
  counselorNote: string;
}

// ============================================================================
// EXPLAINABILITY ENGINE
// ============================================================================

export class ExplainabilityEngine {
  private student: StudentProfile;
  private career: Career;
  private match: CareerMatch;

  constructor(student: StudentProfile, career: Career, match: CareerMatch) {
    this.student = student;
    this.career = career;
    this.match = match;
  }

  /**
   * Generate complete explanation.
   */
  generateExplanation(): CareerExplanation {
    return {
      summary: this.generateSummary(),
      whyThisCareer: this.generateWhyThisCareer(),
      psychology: this.generatePsychologyExplanation(),
      motivations: this.generateMotivationExplanation(),
      workStyle: this.generateWorkStyleExplanation(),
      constraints: this.generateConstraintsExplanation(),
      strengths: this.generateStrengthsExplanation(),
      risks: this.generateRisksExplanation(),
      tradeoffs: this.generateTradeoffsExplanation(),
      recommendation: this.generateRecommendation(),
      nextSteps: this.generateNextSteps(),
      reflectionQuestions: this.generateReflectionQuestions(),
      metadata: {
        overallScore: this.match.score,
        confidenceLevel: this.determineConfidenceLevel(),
        dataQuality: this.assessDataQuality(),
        generationTimestamp: Date.now(),
      },
    };
  }

  // ============================================================================
  // SUMMARY GENERATION
  // ============================================================================

  private generateSummary(): string {
    const score = this.match.score;
    const careerName = this.career.name;

    if (score >= 0.85) {
      return `Based on your profile, ${careerName} appears to be an excellent fit. Your psychological strengths align strongly with what this career demands, and it delivers what you value most. The data suggests this path could be deeply satisfying for you.`;
    } else if (score >= 0.7) {
      return `${careerName} is a strong match for your profile. You have the core psychological traits this career requires, and it aligns well with your motivations. There are some areas worth exploring further, but the fundamentals look promising.`;
    } else if (score >= 0.55) {
      return `${careerName} is a moderate match. While there are genuine alignments between who you are and what this career offers, there are also meaningful differences to consider. This could work with intentional effort in specific areas.`;
    } else {
      return `${careerName} shows some alignment with your profile, but there are significant gaps worth examining. This doesn't mean it's wrong for you, but it suggests you'll need to either develop certain traits or find ways to work around them.`;
    }
  }

  private generateWhyThisCareer(): string {
    const psych = this.match.explanation.psychologicalFit;
    const topMatch = psych.strongestMatches[0];
    const primaryMotivation = this.getPrimaryMotivation();

    let explanation = `This career stands out because `;

    if (topMatch) {
      explanation += `of your strong ${topMatch.trait.toLowerCase()}. You score ${this.formatPercent(topMatch.studentScore)} on this trait, and ${this.career.name} heavily rewards this capability. `;
    }

    if (primaryMotivation) {
      const sat = this.match.explanation.motivationFit.strongestMatches.find(
        m => m.motivation.toLowerCase().includes(primaryMotivation.toLowerCase())
      );
      if (sat) {
        explanation += `More importantly, you care deeply about ${primaryMotivation}, and this career delivers strongly on that front.`;
      }
    }

    return explanation;
  }

  // ============================================================================
  // PSYCHOLOGY EXPLANATION
  // ============================================================================

  private generatePsychologyExplanation(): PsychologicalExplanation {
    const psych = this.match.explanation.psychologicalFit;

    // Natural strengths: where student exceeds career requirements
    const naturalStrengths: TraitExplanation[] = [];
    const allTraits = this.getAllTraitComparisons();

    for (const { trait, student, career, label } of allTraits) {
      if (student >= career + 0.15) {
        naturalStrengths.push({
          trait: label,
          studentScore: student,
          careerRequirement: career,
          explanation: this.generateStrengthExplanation(label, student, career),
          impact: student - career > 0.3 ? 'high' : 'medium',
        });
      }
    }

    // Growth areas: where career demands more
    const growthAreas: TraitExplanation[] = [];
    for (const { trait, student, career, label } of allTraits) {
      if (career >= student + 0.2 && career > 0.6) {
        growthAreas.push({
          trait: label,
          studentScore: student,
          careerRequirement: career,
          explanation: this.generateGrowthExplanation(label, student, career),
          impact: career - student > 0.3 ? 'high' : 'medium',
        });
      }
    }

    // Core alignment assessment
    const coreAlignment = this.generateCoreAlignment(naturalStrengths, growthAreas);

    // Friction points
    const frictionPoints = this.generateFrictionPoints(allTraits);

    return {
      assessment: this.generatePsychologyAssessment(naturalStrengths, growthAreas),
      naturalStrengths: naturalStrengths.slice(0, 3),
      growthAreas: growthAreas.slice(0, 3),
      coreAlignment,
      frictionPoints,
    };
  }

  private getAllTraitComparisons(): Array<{ trait: keyof PsychologicalProfile; label: string; student: number; career: number }> {
    const traitLabels: Record<keyof PsychologicalProfile, string> = {
      analyticalThinking: 'Analytical Thinking',
      creativity: 'Creativity',
      socialOrientation: 'Social Orientation',
      leadership: 'Leadership',
      detailOrientation: 'Detail Orientation',
      curiosity: 'Curiosity',
      competitiveness: 'Competitiveness',
      riskTolerance: 'Risk Tolerance',
    };

    return Object.entries(traitLabels).map(([trait, label]) => ({
      trait: trait as keyof PsychologicalProfile,
      label,
      student: this.student.psychology[trait as keyof StudentPsychology],
      career: this.career.psychologicalProfile[trait as keyof PsychologicalProfile],
    }));
  }

  private generateStrengthExplanation(trait: string, student: number, career: number): string {
    const gap = student - career;

    if (trait === 'Analytical Thinking') {
      return `Your analytical capabilities (${this.formatPercent(student)}) exceed what this career typically demands (${this.formatPercent(career)}). You'll likely find the problem-solving aspects come naturally to you.`;
    } else if (trait === 'Creativity') {
      return `You bring more creative energy (${this.formatPercent(student)}) than this career requires (${this.formatPercent(career)}). This could be an advantage if you find innovative approaches, or a source of frustration if the role is too routine.`;
    } else if (trait === 'Social Orientation') {
      return `Your interpersonal skills (${this.formatPercent(student)}) are stronger than this career demands (${this.formatPercent(career)}). You'll likely build relationships easily and may become a team connector.`;
    } else if (trait === 'Detail Orientation') {
      return `Your attention to detail (${this.formatPercent(student)}) exceeds typical requirements (${this.formatPercent(career)}). You'll catch errors others miss and produce high-quality work.`;
    } else {
      return `Your ${trait.toLowerCase()} (${this.formatPercent(student)}) exceeds what this career typically requires (${this.formatPercent(career)}). This gives you a natural advantage.`;
    }
  }

  private generateGrowthExplanation(trait: string, student: number, career: number): string {
    const gap = career - student;

    if (trait === 'Analytical Thinking') {
      return `This career demands stronger analytical skills (${this.formatPercent(career)}) than you currently demonstrate (${this.formatPercent(student)}). Consider additional coursework or projects that require systematic problem-solving.`;
    } else if (trait === 'Social Orientation') {
      return `Success in this role requires more interpersonal interaction (${this.formatPercent(career)}) than comes naturally to you (${this.formatPercent(student)}). You can succeed, but it may require conscious effort to build relationships.`;
    } else if (trait === 'Risk Tolerance') {
      return `This career involves more uncertainty (${this.formatPercent(career)}) than you're typically comfortable with (${this.formatPercent(student)}). If you pursue this path, build financial buffers and stress-management practices.`;
    } else if (trait === 'Detail Orientation') {
      return `This role requires exceptional precision (${this.formatPercent(career)}). Your current level (${this.formatPercent(student)}) suggests you'll need to develop systems and checklists to maintain quality.`;
    } else {
      return `This career values ${trait.toLowerCase()} more highly (${this.formatPercent(career)}) than your current profile suggests (${this.formatPercent(student)}). This is a development area if you choose this path.`;
    }
  }

  private generateCoreAlignment(strengths: TraitExplanation[], growthAreas: TraitExplanation[]): string {
    if (strengths.length >= 2 && growthAreas.length === 0) {
      return `At a fundamental level, you're wired for this type of work. Your natural tendencies align with what this career rewards most, suggesting you'd find deep satisfaction in the day-to-day reality of this role.`;
    } else if (strengths.length >= 1 && growthAreas.length <= 1) {
      return `Your core personality is generally compatible with this career. While there may be some areas requiring adaptation, your fundamental approach to work aligns reasonably well with what this path demands.`;
    } else if (growthAreas.length >= 2) {
      return `There are meaningful differences between your natural tendencies and what this career requires. This isn't necessarily a deal-breaker—people grow and adapt—but success would require intentional development in several areas.`;
    } else {
      return `Your psychological profile shows moderate alignment with this career. You'd likely find some aspects energizing and others draining. Consider which specific elements of the work most appeal to you.`;
    }
  }

  private generateFrictionPoints(allTraits: Array<{ label: string; student: number; career: number }>): string[] {
    const frictions: string[] = [];

    for (const { label, student, career } of allTraits) {
      if (Math.abs(student - career) > 0.4) {
        if (label === 'Social Orientation' && student < career) {
          frictions.push(`This career demands more social interaction than comes naturally to you. You'll need to consciously engage with colleagues and build relationships.`);
        } else if (label === 'Risk Tolerance' && student < career) {
          frictions.push(`The uncertainty in this career path may create anxiety given your preference for stability.`);
        } else if (label === 'Detail Orientation' && student < career) {
          frictions.push(`The precision required may feel tedious at times. You'll need to develop systems to maintain accuracy.`);
        }
      }
    }

    return frictions;
  }

  private generatePsychologyAssessment(strengths: TraitExplanation[], growthAreas: TraitExplanation[]): string {
    if (strengths.length >= 2 && growthAreas.length === 0) {
      return `Your psychological profile is highly compatible with this career. You possess the core traits this profession rewards, often at levels exceeding typical requirements.`;
    } else if (strengths.length >= 1 && growthAreas.length <= 2) {
      return `Your personality is reasonably well-suited to this career. You have genuine strengths to build on, with a few areas where growth would enhance your effectiveness.`;
    } else {
      return `There are meaningful gaps between your current psychological profile and what this career demands. Success is possible, but would require significant personal development.`;
    }
  }

  // ============================================================================
  // MOTIVATION EXPLANATION
  // ============================================================================

  private generateMotivationExplanation(): MotivationExplanation {
    const matches = this.match.explanation.motivationFit;

    const willSatisfy: MotivationSatisfaction[] = matches.strongestMatches.map(m => ({
      motivation: m.motivation,
      importanceToStudent: m.studentImportance,
      careerDelivery: m.careerReward,
      explanation: this.generateSatisfactionExplanation(m),
    }));

    const potentialGaps: MotivationGap[] = matches.strongestMismatches.map(m => ({
      motivation: m.motivation,
      importanceToStudent: m.studentImportance,
      careerDelivery: m.careerReward,
      explanation: this.generateGapExplanation(m),
      mitigation: this.generateMitigation(m),
    }));

    const rewardDescription = this.generateRewardDescription();

    return {
      assessment: this.generateMotivationAssessment(willSatisfy, potentialGaps),
      willSatisfy: willSatisfy.slice(0, 3),
      potentialGaps: potentialGaps.slice(0, 2),
      rewardDescription,
    };
  }

  private generateSatisfactionExplanation(m: MotivationMatch): string {
    const motivation = m.motivation.toLowerCase().replace(' potential', '');

    if (m.motivation.includes('Income')) {
      return `You care about financial success (${this.formatPercent(m.studentImportance)} importance), and this career delivers excellent earning potential (${this.formatPercent(m.careerReward)}). This alignment suggests you'll feel fairly compensated for your efforts.`;
    } else if (m.motivation.includes('Impact')) {
      return `Making a difference matters deeply to you (${this.formatPercent(m.studentImportance)}), and this career provides meaningful opportunities to contribute (${this.formatPercent(m.careerReward)}). This is often the difference between a job and a calling.`;
    } else if (m.motivation.includes('Freedom')) {
      return `You value autonomy highly (${this.formatPercent(m.studentImportance)}), and this career offers significant independence (${this.formatPercent(m.careerReward)}). You'll likely appreciate the ability to shape your own approach.`;
    } else if (m.motivation.includes('Stability')) {
      return `Job security is important to you (${this.formatPercent(m.studentImportance)}), and this career provides reasonable stability (${this.formatPercent(m.careerReward)}). This should help you sleep well at night.`;
    } else {
      return `This career delivers strongly on ${motivation} (${this.formatPercent(m.careerReward)}), which matters to you (${this.formatPercent(m.studentImportance)}).`;
    }
  }

  private generateGapExplanation(m: MotivationMatch): string {
    if (m.motivation.includes('Income') && m.studentImportance > 0.6) {
      return `You care significantly about income (${this.formatPercent(m.studentImportance)}), but this career offers only moderate earning potential (${this.formatPercent(m.careerReward)}). Consider whether the other rewards compensate for this.`;
    } else if (m.motivation.includes('Impact') && m.studentImportance > 0.6) {
      return `Making a difference is important to you (${this.formatPercent(m.studentImportance)}), yet this career has limited impact potential (${this.formatPercent(m.careerReward)}). If meaning matters deeply, explore how people in this field create purpose.`;
    } else if (m.motivation.includes('Stability') && m.studentImportance > 0.6) {
      return `You value stability (${this.formatPercent(m.studentImportance)}), but this career carries more uncertainty (${this.formatPercent(m.careerReward)}). Consider your risk tolerance carefully.`;
    } else {
      return `This career doesn't strongly deliver on ${m.motivation.toLowerCase()} (${this.formatPercent(m.careerReward)}), though this matters less to you (${this.formatPercent(m.studentImportance)}).`;
    }
  }

  private generateMitigation(m: MotivationMatch): string | undefined {
    if (m.motivation.includes('Income')) {
      return `Consider specializing in high-paying subfields or developing complementary skills that command premium compensation.`;
    } else if (m.motivation.includes('Impact')) {
      return `Look for roles within this field that serve underserved populations, or consider how to create impact through volunteer work alongside your career.`;
    } else if (m.motivation.includes('Freedom')) {
      return `After gaining experience, you might transition to consulting or start your own practice to increase autonomy.`;
    }
    return undefined;
  }

  private generateRewardDescription(): string {
    const rewards = this.career.rewardProfile;

    const highRewards: string[] = [];
    if (rewards.incomePotential >= 0.7) highRewards.push('financial rewards');
    if (rewards.impactPotential >= 0.7) highRewards.push('meaningful contribution');
    if (rewards.statusPotential >= 0.7) highRewards.push('social recognition');
    if (rewards.freedomPotential >= 0.7) highRewards.push('autonomy');
    if (rewards.stabilityPotential >= 0.7) highRewards.push('security');

    if (highRewards.length === 0) {
      return `This career offers moderate rewards across most dimensions—it's solid but not exceptional in any particular area.`;
    } else if (highRewards.length === 1) {
      return `This career excels primarily in ${highRewards[0]}. If that's what you value most, this could be perfect. If you want more balance, consider carefully.`;
    } else {
      return `This career delivers strongly on ${highRewards.slice(0, -1).join(', ')} and ${highRewards[highRewards.length - 1]}.`;
    }
  }

  private generateMotivationAssessment(satisfies: MotivationSatisfaction[], gaps: MotivationGap[]): string {
    if (satisfies.length >= 2 && gaps.length === 0) {
      return `This career delivers on what matters most to you. The alignment between your values and what this path offers is one of its strongest selling points.`;
    } else if (satisfies.length >= 1 && gaps.length <= 1) {
      return `Most of what you care about is present in this career, with one or two areas where you'll need to find creative solutions or adjust expectations.`;
    } else if (gaps.length >= 2) {
      return `There are gaps between what motivates you and what this career naturally provides. Consider whether you can get these needs met outside of work.`;
    } else {
      return `The motivation fit is moderate. This career offers some of what you value, but not everything.`;
    }
  }

  // ============================================================================
  // WORK STYLE EXPLANATION
  // ============================================================================

  private generateWorkStyleExplanation(): WorkStyleExplanation {
    const ws = this.career.workStyle;

    // Day-to-day reality
    const dayToDay = this.generateDayToDayReality(ws);

    // Lifestyle implications
    const lifestyle = this.generateLifestyleImplications(ws);

    // Positive aspects
    const positives = this.generatePositiveAspects(ws);

    // Challenging aspects
    const challenges = this.generateChallengingAspects(ws);

    return {
      assessment: this.generateWorkStyleAssessment(),
      dayToDayReality: dayToDay,
      lifestyleImplications: lifestyle,
      positiveAspects: positives,
      challengingAspects: challenges,
    };
  }

  private generateDayToDayReality(ws: WorkStyleProfile): string {
    const elements: string[] = [];

    if (ws.remoteWork >= 0.7) {
      elements.push(`You'll primarily work from home or remotely`);
    } else if (ws.officeWork >= 0.7) {
      elements.push(`You'll spend most days in an office environment`);
    } else if (ws.fieldWork >= 0.5) {
      elements.push(`Much of your work happens on-site or in the field`);
    }

    if (ws.teamOrientation >= 0.7) {
      elements.push(`collaborating closely with colleagues`);
    } else if (ws.soloOrientation >= 0.7) {
      elements.push(`working independently with minimal supervision`);
    } else {
      elements.push(`balancing solo work with team collaboration`);
    }

    if (ws.travelRequirement >= 0.5) {
      elements.push(`with regular travel to different locations`);
    }

    if (ws.structuredEnvironment >= 0.7) {
      elements.push(`within clear processes and established procedures`);
    } else if (ws.unstructuredEnvironment >= 0.7) {
      elements.push(`in a flexible environment where you define your own approach`);
    }

    return elements.join(', ') + '.';
  }

  private generateLifestyleImplications(ws: WorkStyleProfile): string {
    const implications: string[] = [];

    if (ws.remoteWork >= 0.7) {
      implications.push(`The remote flexibility means you can live where you want and avoid long commutes.`);
    } else if (ws.officeWork >= 0.7) {
      implications.push(`The office-based nature means commuting and less location flexibility, but also clearer boundaries between work and home.`);
    }

    if (ws.travelRequirement >= 0.6) {
      implications.push(`Regular travel can be exciting but also tiring and disruptive to personal routines.`);
    }

    if (ws.teamOrientation >= 0.7) {
      implications.push(`The collaborative nature means you'll have social connection at work, but also potential for meeting overload.`);
    } else if (ws.soloOrientation >= 0.7) {
      implications.push(`The independent nature offers focus time but could feel isolating if you crave social interaction.`);
    }

    return implications.join(' ') || `The work style is fairly standard with no extreme lifestyle implications.`;
  }

  private generatePositiveAspects(ws: WorkStyleProfile): string[] {
    const positives: string[] = [];

    if (ws.remoteWork >= 0.6) {
      positives.push(`Flexibility to work from anywhere`);
    }
    if (ws.unstructuredEnvironment >= 0.6) {
      positives.push(`Freedom to approach work your own way`);
    }
    if (ws.teamOrientation >= 0.6) {
      positives.push(`Built-in social connection and collaboration`);
    }
    if (ws.structuredEnvironment >= 0.6) {
      positives.push(`Clear expectations and established processes`);
    }
    if (ws.travelRequirement <= 0.3) {
      positives.push(`Predictable schedule without constant travel`);
    }

    return positives.length > 0 ? positives : [`Stable, predictable work environment`];
  }

  private generateChallengingAspects(ws: WorkStyleProfile): string[] {
    const challenges: string[] = [];

    if (ws.remoteWork <= 0.3 && this.student.psychology.creativity >= 0.7) {
      challenges.push(`Limited remote flexibility may feel constraining given your creative nature`);
    }
    if (ws.travelRequirement >= 0.6) {
      challenges.push(`Regular travel can be exhausting and disruptive`);
    }
    if (ws.soloOrientation >= 0.7 && this.student.psychology.socialOrientation >= 0.7) {
      challenges.push(`Independent work may feel isolating given your social nature`);
    }
    if (ws.structuredEnvironment >= 0.7 && this.student.psychology.creativity >= 0.7) {
      challenges.push(`Rigid processes may frustrate your creative approach`);
    }

    return challenges.length > 0 ? challenges : [`Few significant work style concerns`];
  }

  private generateWorkStyleAssessment(): string {
    const fit = this.match.explanation.workStyleFit;

    if (fit.score >= 0.8) {
      return `The day-to-day reality of this career aligns well with how you prefer to work. This "fit" between work style and personal preference often determines long-term satisfaction.`;
    } else if (fit.score >= 0.6) {
      return `The work environment is generally compatible with your preferences, though there are some aspects that may require adjustment.`;
    } else {
      return `There are meaningful differences between how you prefer to work and what this career requires. Consider whether you can adapt or if this would be a source of ongoing friction.`;
    }
  }

  // ============================================================================
  // CONSTRAINTS EXPLANATION
  // ============================================================================

  private generateConstraintsExplanation(): ConstraintsExplanation {
    const constraints = this.match.explanation.constraintFit;

    // Support both old format (with results) and new format (with satisfied/violated)
    const results: Array<{ constraint: string; isSatisfied: boolean; severity: number; explanation: string }> = 
      (constraints as any).results || [
        ...(constraints.satisfied || []).map((c: any) => ({ ...c, isSatisfied: true, severity: 0 })),
        ...(constraints.violated || []).map((c: any) => ({ ...c, isSatisfied: false, severity: c.severity || 0.5 })),
      ];

    const specificConstraints: SpecificConstraint[] = results.map(r => ({
      constraint: r.constraint,
      status: r.isSatisfied ? 'satisfied' : (r.severity >= 0.7 ? 'significant-challenge' : 'minor-issue'),
      explanation: r.explanation,
      actionableAdvice: r.isSatisfied ? undefined : this.generateConstraintAdvice(r),
    }));

    const feasibility = this.determineFeasibility(specificConstraints);
    const summary = this.generateConstraintsSummary(specificConstraints, feasibility);
    const pathForward = this.generatePathForward(specificConstraints);

    return {
      feasibility,
      summary,
      specificConstraints,
      pathForward,
    };
  }

  private generateConstraintAdvice(result: ConstraintResult): string | undefined {
    if (result.constraint === 'Coaching Access') {
      return `Explore free online resources, peer study groups, or scholarship programs for coaching.`;
    } else if (result.constraint === 'Urban Location') {
      return `Consider whether you're willing to relocate after building initial skills, or look for remote-first companies.`;
    } else if (result.constraint === 'English Proficiency') {
      return `Invest in English improvement through online courses, conversation practice, or immersion programs.`;
    } else if (result.constraint === 'Relocation') {
      return `Explore whether this career has remote options or satellite offices in your preferred location.`;
    }
    return undefined;
  }

  private determineFeasibility(constraints: SpecificConstraint[]): ConstraintsExplanation['feasibility'] {
    const significant = constraints.filter(c => c.status === 'significant-challenge').length;
    const minor = constraints.filter(c => c.status === 'minor-issue').length;

    if (significant === 0) return 'straightforward';
    if (significant === 1 && minor <= 1) return 'manageable';
    if (significant <= 2) return 'challenging';
    return 'significant-barriers';
  }

  private generateConstraintsSummary(constraints: SpecificConstraint[], feasibility: string): string {
    const significant = constraints.filter(c => c.status === 'significant-challenge').length;
    const minor = constraints.filter(c => c.status === 'minor-issue').length;

    if (feasibility === 'straightforward') {
      return `From a practical standpoint, this career path is accessible to you. Your current situation—financial, geographic, and educational—positions you well to pursue this option.`;
    } else if (feasibility === 'manageable') {
      return `There are some practical considerations to address, but nothing insurmountable. With focused effort on ${significant === 1 ? 'one key area' : 'a few areas'}, this path remains viable.`;
    } else if (feasibility === 'challenging') {
      return `This career presents practical challenges given your current situation. While not impossible, you'll need to make strategic decisions and potentially accept tradeoffs in other areas of your life.`;
    } else {
      return `There are significant practical barriers to entering this career from your current position. This doesn't mean it's impossible, but it would require exceptional effort, resources, or circumstances.`;
    }
  }

  private generatePathForward(constraints: SpecificConstraint[]): string {
    const challenges = constraints.filter(c => c.status !== 'satisfied');

    if (challenges.length === 0) {
      return `Focus on building the skills and connections needed for entry. Your constraints are satisfied—now it's about execution.`;
    }

    const actionableChallenges = challenges.filter(c => c.actionableAdvice);

    if (actionableChallenges.length > 0) {
      return `Priority areas: ${actionableChallenges.map(c => c.constraint).join(', ')}. Start with ${actionableChallenges[0].constraint.toLowerCase()}: ${actionableChallenges[0].actionableAdvice}`;
    }

    return `Work through the identified constraints systematically. Consider speaking with people who faced similar challenges to learn from their experience.`;
  }

  // ============================================================================
  // STRENGTHS EXPLANATION
  // ============================================================================

  private generateStrengthsExplanation(): StrengthsExplanation {
    const successFactors = this.identifySuccessFactors();
    const naturalAdvantages = this.identifyNaturalAdvantages();
    const competitiveEdge = this.generateCompetitiveEdge();

    return {
      successFactors,
      naturalAdvantages,
      competitiveEdge,
    };
  }

  private identifySuccessFactors(): string[] {
    const factors: string[] = [];
    const psych = this.student.psychology;
    const career = this.career.psychologicalProfile;

    if (psych.analyticalThinking >= career.analyticalThinking - 0.1) {
      factors.push(`Your analytical capabilities give you a solid foundation for the problem-solving this career requires.`);
    }
    if (psych.curiosity >= 0.7 && career.curiosity >= 0.6) {
      factors.push(`Your natural curiosity will drive continuous learning, which is essential in this field.`);
    }
    if (psych.detailOrientation >= career.detailOrientation - 0.1) {
      factors.push(`Your attention to detail means you'll produce quality work that meets professional standards.`);
    }
    if (psych.socialOrientation >= career.socialOrientation) {
      factors.push(`Your interpersonal skills will help you build the relationships necessary for advancement.`);
    }

    return factors.length > 0 ? factors : [`Your overall psychological profile suggests you can develop the necessary capabilities.`];
  }

  private identifyNaturalAdvantages(): string[] {
    const advantages: string[] = [];

    const comparisons = this.getAllTraitComparisons();
    for (const { label, student, career } of comparisons) {
      if (student >= career + 0.2) {
        if (label === 'Analytical Thinking') {
          advantages.push(`Problem-solving comes naturally to you—you may solve complex issues that others struggle with.`);
        } else if (label === 'Creativity') {
          advantages.push(`Your creative approach could lead to innovations or unique solutions in this field.`);
        } else if (label === 'Social Orientation') {
          advantages.push(`You'll likely build strong professional networks faster than peers.`);
        }
      }
    }

    if (this.match.explanation.motivationFit.score >= 0.8) {
      advantages.push(`High motivation alignment means you'll likely persist through challenges that discourage others.`);
    }

    return advantages.length > 0 ? advantages : [`Consistent effort and your solid foundation`];
  }

  private generateCompetitiveEdge(): string {
    const psychAdvantages = this.getAllTraitComparisons().filter(c => c.student >= c.career + 0.15);

    if (psychAdvantages.length >= 2) {
      return `You bring ${psychAdvantages.length} psychological strengths that exceed typical requirements. This combination is relatively rare and could distinguish you in this field.`;
    } else if (this.match.explanation.psychologicalFit.score >= 0.75) {
      return `Your solid psychological alignment means you can focus on skill development rather than forcing yourself into an unnatural mode of working.`;
    } else {
      return `While you don't have dramatic natural advantages, your profile suggests you can succeed with deliberate effort and skill development.`;
    }
  }

  // ============================================================================
  // RISKS EXPLANATION
  // ============================================================================

  private generateRisksExplanation(): RisksExplanation {
    const primaryRisks = this.identifyPrimaryRisks();
    const mitigation = this.generateMitigationStrategies(primaryRisks);
    const realityCheck = this.generateRealityCheck(primaryRisks);

    return {
      primaryRisks,
      mitigation,
      realityCheck,
    };
  }

  private identifyPrimaryRisks(): RiskDetail[] {
    const risks: RiskDetail[] = [];
    const riskProfile = this.career.riskProfile;

    if (riskProfile.burnoutRisk >= 0.6) {
      risks.push({
        risk: 'Burnout',
        level: riskProfile.burnoutRisk >= 0.75 ? 'high' : 'medium',
        explanation: `The demands of this career create elevated burnout risk. Long hours, high stress, or emotional demands can lead to exhaustion.`,
        probability: riskProfile.burnoutRisk >= 0.75 ? 'likely' : 'possible',
      });
    }

    if (riskProfile.automationRisk >= 0.6) {
      risks.push({
        risk: 'Automation/AI Disruption',
        level: riskProfile.automationRisk >= 0.75 ? 'high' : 'medium',
        explanation: `Technology may significantly change or reduce opportunities in this field within the next decade.`,
        probability: riskProfile.automationRisk >= 0.75 ? 'likely' : 'possible',
      });
    }

    if (riskProfile.competitionLevel >= 0.7) {
      risks.push({
        risk: 'High Competition',
        level: 'high',
        explanation: `Many people want these roles, making entry and advancement competitive. You'll need to distinguish yourself.`,
        probability: 'likely',
      });
    }

    if (riskProfile.incomeVolatility >= 0.6) {
      risks.push({
        risk: 'Income Volatility',
        level: riskProfile.incomeVolatility >= 0.75 ? 'high' : 'medium',
        explanation: `Earnings may fluctuate significantly, making financial planning challenging.`,
        probability: riskProfile.incomeVolatility >= 0.75 ? 'likely' : 'possible',
      });
    }

    // Add fit-based risks
    const psychMismatches = this.match.explanation.psychologicalFit.strongestMismatches;
    if (psychMismatches.length > 0 && psychMismatches[0].matchScore < 0.4) {
      const mismatch = psychMismatches[0];
      risks.push({
        risk: `Personality-Role Mismatch`,
        level: mismatch.matchScore < 0.3 ? 'high' : 'medium',
        explanation: `Your ${mismatch.trait.toLowerCase()} differs significantly from what this role demands. This could lead to ongoing stress.`,
        probability: 'possible',
      });
    }

    return risks;
  }

  private generateMitigationStrategies(risks: RiskDetail[]): string[] {
    const strategies: string[] = [];

    for (const risk of risks) {
      if (risk.risk === 'Burnout') {
        strategies.push(`Establish firm boundaries early. Build stress-management practices into your routine before you need them.`);
      } else if (risk.risk === 'Automation/AI Disruption') {
        strategies.push(`Focus on developing human-centric skills that complement rather than compete with technology.`);
      } else if (risk.risk === 'High Competition') {
        strategies.push(`Differentiate through specialization or by combining this with complementary skills.`);
      } else if (risk.risk === 'Income Volatility') {
        strategies.push(`Build a larger emergency fund than typical—aim for 12+ months of expenses.`);
      }
    }

    if (strategies.length === 0) {
      strategies.push(`The risks in this career are manageable with standard career planning.`);
    }

    return strategies;
  }

  private generateRealityCheck(risks: RiskDetail[]): string {
    const highRisks = risks.filter(r => r.level === 'high');

    if (highRisks.length === 0) {
      return `This is a relatively low-risk career choice. While no path is guaranteed, the downsides here are manageable.`;
    } else if (highRisks.length === 1) {
      return `The main risk—${highRisks[0].risk.toLowerCase()}—is real and worth taking seriously. However, many people navigate this successfully with awareness and preparation.`;
    } else {
      return `This career carries multiple significant risks. Success is absolutely possible, but it will require vigilance, adaptability, and potentially some luck. Make sure the potential rewards justify these risks for you personally.`;
    }
  }

  // ============================================================================
  // TRADEOFFS EXPLANATION
  // ============================================================================

  private generateTradeoffsExplanation(): TradeoffsExplanation {
    const gains = this.identifyGains();
    const sacrifices = this.identifySacrifices();
    const centralTradeoff = this.identifyCentralTradeoff();
    const comparedToAlternatives = this.generateComparisonToAlternatives();

    return {
      gains,
      sacrifices,
      centralTradeoff,
      comparedToAlternatives,
    };
  }

  private identifyGains(): string[] {
    const gains: string[] = [];
    const rewards = this.career.rewardProfile;

    if (rewards.incomePotential >= 0.7) gains.push(`Strong financial compensation`);
    if (rewards.impactPotential >= 0.7) gains.push(`Meaningful work that makes a difference`);
    if (rewards.statusPotential >= 0.7) gains.push(`Social respect and recognition`);
    if (rewards.freedomPotential >= 0.7) gains.push(`Autonomy and flexibility`);
    if (rewards.stabilityPotential >= 0.7) gains.push(`Job security and predictability`);

    const psychMatches = this.match.explanation.psychologicalFit.strongestMatches;
    if (psychMatches.length >= 2) {
      gains.push(`Work that leverages your natural strengths`);
    }

    return gains.length > 0 ? gains : [`Solid career prospects with moderate rewards`];
  }

  private identifySacrifices(): string[] {
    const sacrifices: string[] = [];
    const risks = this.career.riskProfile;

    if (risks.burnoutRisk >= 0.6) sacrifices.push(`Personal time and work-life balance`);
    if (risks.incomeVolatility >= 0.5) sacrifices.push(`Income predictability`);
    if (this.career.workStyle.travelRequirement >= 0.6) sacrifices.push(`Geographic stability`);
    if (this.match.explanation.motivationFit.strongestMismatches.length > 0) {
      const gap = this.match.explanation.motivationFit.strongestMismatches[0];
      if (gap.studentImportance >= 0.5) {
        sacrifices.push(`${gap.motivation.replace(' Potential', '')} (since this career scores lower than you'd prefer)`);
      }
    }

    if (risks.competitionLevel >= 0.7) sacrifices.push(`Ease of entry and advancement`);

    return sacrifices.length > 0 ? sacrifices : [`Few major tradeoffs—this is a relatively balanced choice`];
  }

  private identifyCentralTradeoff(): string {
    const rewards = this.career.rewardProfile;
    const risks = this.career.riskProfile;

    // Classic tradeoffs
    if (rewards.incomePotential >= 0.8 && risks.burnoutRisk >= 0.6) {
      return `The central tradeoff is money versus wellbeing. This career can pay very well, but may demand significant personal sacrifice to achieve that.`;
    }
    if (rewards.freedomPotential >= 0.7 && risks.incomeVolatility >= 0.6) {
      return `The central tradeoff is autonomy versus security. You get flexibility, but with less predictable income.`;
    }
    if (rewards.impactPotential >= 0.7 && rewards.incomePotential <= 0.5) {
      return `The central tradeoff is meaning versus money. This work matters, but it won't make you wealthy.`;
    }
    if (rewards.stabilityPotential >= 0.7 && rewards.freedomPotential <= 0.4) {
      return `The central tradeoff is security versus autonomy. You get predictability, but less control over your work.`;
    }
    if (risks.competitionLevel >= 0.7 && rewards.statusPotential >= 0.7) {
      return `The central tradeoff is prestige versus accessibility. This is a respected career, but getting in is competitive.`;
    }

    return `This career doesn't present dramatic tradeoffs. It's a relatively balanced choice with moderate rewards and manageable risks.`;
  }

  private generateComparisonToAlternatives(): string {
    const score = this.match.score;

    if (score >= 0.8) {
      return `Compared to other options, this career aligns exceptionally well with your profile. Unless you have other paths that also score highly, this deserves serious consideration.`;
    } else if (score >= 0.65) {
      return `This is a solid option worth comparing against others. The specific fit will depend on how much the mismatches matter to you personally.`;
    } else {
      return `Unless this career has unique appeal beyond what the data captures, you may want to explore alternatives with stronger alignment scores.`;
    }
  }

  // ============================================================================
  // RECOMMENDATION
  // ============================================================================

  private generateRecommendation(): RecommendationExplanation {
    const score = this.match.score;

    // Support both old format (with results) and new format (with satisfied/violated)
    const constraintResults = (this.match.explanation.constraintFit as any).results || [
      ...((this.match.explanation.constraintFit.satisfied || []).map((c: any) => ({ ...c, isSatisfied: true, severity: 0 }))),
      ...((this.match.explanation.constraintFit.violated || []).map((c: any) => ({ ...c, isSatisfied: false, severity: c.severity || 0.5 }))),
    ];

    const feasibility = this.determineFeasibility(constraintResults.map((r: any) => ({
      constraint: r.constraint,
      status: r.isSatisfied ? 'satisfied' : (r.severity >= 0.7 ? 'significant-challenge' : 'minor-issue'),
      explanation: r.explanation,
    })));

    let verdict: RecommendationExplanation['verdict'];
    if (score >= 0.8 && feasibility !== 'significant-barriers') {
      verdict = 'strong-recommend';
    } else if (score >= 0.7 && feasibility !== 'challenging' && feasibility !== 'significant-barriers') {
      verdict = 'recommend';
    } else if (score >= 0.55 && feasibility !== 'significant-barriers') {
      verdict = 'consider';
    } else if (score >= 0.4) {
      verdict = 'proceed-with-caution';
    } else {
      verdict = 'not-recommended';
    }

    return {
      verdict,
      idealFor: this.generateIdealFor(),
      thinkTwiceIf: this.generateThinkTwiceIf(),
      counselorNote: this.generateCounselorNote(verdict),
    };
  }

  private generateIdealFor(): string {
    const elements: string[] = [];
    const psych = this.career.psychologicalProfile;

    if (psych.analyticalThinking >= 0.7) elements.push(`analytical thinkers`);
    if (psych.creativity >= 0.7) elements.push(`creative problem-solvers`);
    if (psych.socialOrientation >= 0.7) elements.push(`people-oriented individuals`);
    if (psych.detailOrientation >= 0.7) elements.push(`detail-oriented professionals`);

    if (this.career.rewardProfile.incomePotential >= 0.7) elements.push(`those prioritizing financial growth`);
    if (this.career.rewardProfile.impactPotential >= 0.7) elements.push(`those seeking meaningful work`);
    if (this.career.rewardProfile.freedomPotential >= 0.7) elements.push(`those valuing autonomy`);

    return elements.length > 0
      ? `Someone who is ${elements.slice(0, -1).join(', ')} and ${elements[elements.length - 1]}.`
      : `Someone with solid general capabilities and genuine interest in the field.`;
  }

  private generateThinkTwiceIf(): string {
    const warnings: string[] = [];
    const psych = this.career.psychologicalProfile;
    const risks = this.career.riskProfile;

    if (psych.riskTolerance <= 0.4 && risks.incomeVolatility >= 0.5) {
      warnings.push(`you're risk-averse and this has income volatility`);
    }
    if (psych.socialOrientation >= 0.7 && this.career.workStyle.soloOrientation >= 0.6) {
      warnings.push(`you're highly social and this involves significant solo work`);
    }
    if (risks.burnoutRisk >= 0.7) {
      warnings.push(`work-life balance is a priority for you`);
    }

    const topMismatch = this.match.explanation.psychologicalFit.strongestMismatches[0];
    if (topMismatch && topMismatch.matchScore < 0.4) {
      warnings.push(`${topMismatch.trait.toLowerCase()} isn't your strong suit`);
    }

    return warnings.length > 0
      ? `You should carefully consider this path if ${warnings.join(', or if ')}.`
      : `You don't have obvious red flags, but trust your gut if something feels off.`;
  }

  private generateCounselorNote(verdict: RecommendationExplanation['verdict']): string {
    switch (verdict) {
      case 'strong-recommend':
        return `The data strongly supports this direction. Your profile, motivations, and practical circumstances all point toward this career. While data isn't destiny, this is a compelling match worth serious exploration. Take the next step—shadow someone in the field, do an informational interview, or try a small project in this area.`;

      case 'recommend':
        return `This is a well-aligned option with strong fundamentals. The fit is good enough that you could build a satisfying career here. The key question isn't whether you can succeed—you can—but whether this excites you. Use the next steps below to explore further.`;

      case 'consider':
        return `This career has genuine potential for you, but it requires thoughtful consideration of the gaps identified. Success is achievable, but it won't be effortless. Think about whether the appealing aspects motivate you enough to work through the challenges.`;

      case 'proceed-with-caution':
        return `There are meaningful concerns with this match. That doesn't mean it's wrong, but it does mean you should be intentional. If you pursue this, go in with eyes open about the gaps and a plan to address them. Consider also exploring options with stronger alignment scores.`;

      case 'not-recommended':
        return `Based on the data, this career path presents significant challenges relative to your profile. While passion can overcome many obstacles, be honest with yourself about whether this specific path serves your long-term wellbeing. There may be related careers that better fit who you are.`;
    }
  }

  // ============================================================================
  // NEXT STEPS & REFLECTION
  // ============================================================================

  private generateNextSteps(): string[] {
    const steps: string[] = [];

    steps.push(`Informational interview: Talk to 2-3 people currently in this field to validate these insights.`);

    if (this.match.explanation.psychologicalFit.strongestMismatches.length > 0) {
      steps.push(`Explore the gap: ${this.match.explanation.psychologicalFit.strongestMismatches[0].explanation}`);
    }

    if (this.career.workStyle.remoteWork >= 0.5) {
      steps.push(`Try remote work: If you haven't worked remotely before, experiment with it to confirm you enjoy it.`);
    }

    // Support both old format (with results) and new format (with satisfied/violated)
    const constraintResults = (this.match.explanation.constraintFit as any).results || [
      ...((this.match.explanation.constraintFit.satisfied || []).map((c: any) => ({ ...c, isSatisfied: true }))),
      ...((this.match.explanation.constraintFit.violated || []).map((c: any) => ({ ...c, isSatisfied: false }))),
    ];

    if (constraintResults.some((r: any) => !r.isSatisfied)) {
      steps.push(`Address constraints: Start working on the most significant constraint identified above.`);
    }

    steps.push(`Skill check: Try a small project or online course in this area to confirm you enjoy the actual work.`);

    return steps;
  }

  private generateReflectionQuestions(): string[] {
    const questions: string[] = [];

    const topMatch = this.match.explanation.psychologicalFit.strongestMatches[0];
    if (topMatch) {
      questions.push(`When have you felt most energized using your ${topMatch.trait.toLowerCase()}? Does this career offer those opportunities?`);
    }

    if (this.match.explanation.motivationFit.strongestMatches.length > 0) {
      const sat = this.match.explanation.motivationFit.strongestMatches[0];
      questions.push(`How important is ${sat.motivation.toLowerCase().replace(' potential', '')} to your long-term satisfaction?`);
    }

    if (this.career.riskProfile.burnoutRisk >= 0.6) {
      questions.push(`What are your non-negotiable boundaries around work-life balance? Can you maintain them in this field?`);
    }

    // Support both old format (with results) and new format (with satisfied/violated)
    const constraintResults = (this.match.explanation.constraintFit as any).results || [
      ...((this.match.explanation.constraintFit.satisfied || []).map((c: any) => ({ ...c, isSatisfied: true }))),
      ...((this.match.explanation.constraintFit.violated || []).map((c: any) => ({ ...c, isSatisfied: false }))),
    ];

    if (constraintResults.some((r: any) => !r.isSatisfied)) {
      questions.push(`How much are you willing to adapt or sacrifice to overcome the constraints identified?`);
    }

    questions.push(`Imagine yourself in this career five years from now. What does a typical day look like? How do you feel about it?`);

    return questions;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getPrimaryMotivation(): string | null {
    const motivations = [
      { key: 'money', value: this.student.motivations.money, label: 'income' },
      { key: 'impact', value: this.student.motivations.impact, label: 'impact' },
      { key: 'status', value: this.student.motivations.status, label: 'status' },
      { key: 'freedom', value: this.student.motivations.freedom, label: 'freedom' },
      { key: 'stability', value: this.student.motivations.stability, label: 'stability' },
    ];

    motivations.sort((a, b) => b.value - a.value);
    return motivations[0].value >= 0.6 ? motivations[0].label : null;
  }

  private determineConfidenceLevel(): CareerExplanation['metadata']['confidenceLevel'] {
    const score = this.match.score;
    if (score >= 0.75) return 'high';
    if (score >= 0.55) return 'medium';
    return 'low';
  }

  private assessDataQuality(): CareerExplanation['metadata']['dataQuality'] {
    const completeness = this.student.completeness;
    if (completeness >= 0.8) return 'complete';
    if (completeness >= 0.5) return 'partial';
    return 'minimal';
  }

  private formatPercent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Generate a comprehensive career explanation.
 */
export function explainCareerMatch(
  student: StudentProfile,
  career: Career,
  match: CareerMatch
): CareerExplanation {
  const engine = new ExplainabilityEngine(student, career, match);
  return engine.generateExplanation();
}

/**
 * Generate explanations for multiple career matches.
 */
export function explainMultipleMatches(
  student: StudentProfile,
  matches: Array<{ career: Career; match: CareerMatch }>
): CareerExplanation[] {
  return matches.map(({ career, match }) => explainCareerMatch(student, career, match));
}
