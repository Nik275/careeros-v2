/**
 * CareerOS Matching Engine V1
 *
 * CareerOS - Career Intelligence System
 *
 * Matches StudentProfile to Careers using deterministic, explainable algorithms.
 * No AI, no randomness, pure functions only.
 *
 * Matching Dimensions:
 *   1. Psychological Fit (35%): Student traits vs Career requirements
 *   2. Work-Style Fit (25%): Student preferences vs Career work style
 *   3. Motivation Fit (25%): Student motivations vs Career rewards
 *   4. Constraint Fit (15%): Student constraints vs Career requirements
 *
 * Architecture Principles:
 *   - Deterministic: Same input always produces same output
 *   - Explainable: Every score has human-readable reasoning
 *   - Pure Functions: No side effects, no external state
 *   - Composable: Each dimension calculated independently then combined
 *   - Type-Safe: Full TypeScript coverage
 */

import type { Career, CareerScore, PsychologicalProfile, WorkStyleProfile, RewardProfile } from '../../domains/career/Career';
import type { StudentProfile, PsychologyProfile as StudentPsychology, Motivations, RealityConstraints } from '../../domains/student/StudentProfile';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Student's work style preferences.
 * Used for matching against Career work style.
 */
export interface WorkStylePreference {
  /** Preference for remote work (0.0 = dislike, 1.0 = prefer) */
  remoteWork: CareerScore;

  /** Preference for office work (0.0 = dislike, 1.0 = prefer) */
  officeWork: CareerScore;

  /** Preference for field work (0.0 = dislike, 1.0 = prefer) */
  fieldWork: CareerScore;

  /** Comfort with travel (0.0 = avoid, 1.0 = enjoy) */
  travelComfort: CareerScore;

  /** Preference for teamwork (0.0 = solo, 1.0 = team) */
  teamPreference: CareerScore;

  /** Preference for structure (0.0 = flexible, 1.0 = structured) */
  structurePreference: CareerScore;
}

/**
 * Combined matching input for a student.
 */
export interface MatchingInput {
  /** Student's psychological profile */
  psychology: StudentPsychology;

  /** Student's career motivations */
  motivations: Motivations;

  /** Student's reality constraints */
  constraints: RealityConstraints;

  /** Student's work style preferences */
  workStylePreference: WorkStylePreference;

  /** Optional: Minimum threshold for matches (default: 0.3) */
  minimumThreshold?: number;

  /** Optional: Weights for different dimensions */
  weights?: MatchingWeights;
}

/**
 * Configurable weights for matching dimensions.
 * All weights should sum to 1.0.
 */
export interface MatchingWeights {
  /** Weight for psychological fit (default: 0.35) */
  psychological: number;

  /** Weight for work-style fit (default: 0.25) */
  workStyle: number;

  /** Weight for motivation fit (default: 0.25) */
  motivation: number;

  /** Weight for constraint fit (default: 0.15) */
  constraint: number;
}

/**
 * Individual trait match detail.
 */
export interface TraitMatch {
  /** Trait name */
  trait: string;

  /** Student's score */
  studentScore: number;

  /** Career's requirement */
  careerScore: number;

  /** Match score (0.0 - 1.0) */
  matchScore: number;

  /** Human-readable explanation */
  explanation: string;
}

/**
 * Motivation match detail.
 */
export interface MotivationMatch {
  /** Motivation name */
  motivation: string;

  /** Student's importance for this motivation */
  studentImportance: number;

  /** Career's reward for this motivation */
  careerReward: number;

  /** Match score (0.0 - 1.0) */
  matchScore: number;

  /** Human-readable explanation */
  explanation: string;
}

/**
 * Constraint assessment result.
 */
export interface ConstraintResult {
  /** Constraint name */
  constraint: string;

  /** Whether this constraint is satisfied */
  isSatisfied: boolean;

  /** Severity of constraint (0.0 = minor, 1.0 = blocking) */
  severity: number;

  /** Human-readable explanation */
  explanation: string;
}

/**
 * Detailed explanation for a career match.
 */
export interface MatchExplanation {
  /** Overall match score */
  overallScore: number;

  /** Psychological fit details */
  psychologicalFit: {
    score: number;
    strongestMatches: TraitMatch[];
    strongestMismatches: TraitMatch[];
    summary: string;
  };

  /** Work-style fit details */
  workStyleFit: {
    score: number;
    strongestMatches: TraitMatch[];
    strongestMismatches: TraitMatch[];
    summary: string;
  };

  /** Motivation fit details */
  motivationFit: {
    score: number;
    strongestMatches: MotivationMatch[];
    strongestMismatches: MotivationMatch[];
    summary: string;
  };

  /** Constraint fit details */
  constraintFit: {
    score: number;
    satisfied: ConstraintResult[];
    violated: ConstraintResult[];
    summary: string;
  };

  /** Overall reasoning */
  reasoning: string[];

  /** Key insights */
  insights: string[];
}

/**
 * Career match result.
 */
export interface CareerMatch {
  /** Career ID */
  careerId: string;

  /** Career slug */
  careerSlug: string;

  /** Career name */
  careerName: string;

  /** Overall match score (0.0 - 1.0) */
  score: number;

  /** Detailed explanation */
  explanation: MatchExplanation;
}

/**
 * Matching result for multiple careers.
 */
export interface MatchingResult {
  /** All career matches sorted by score (descending) */
  matches: CareerMatch[];

  /** Top N matches */
  topMatches: CareerMatch[];

  /** Matches that meet minimum threshold */
  qualifyingMatches: CareerMatch[];

  /** Best match */
  bestMatch: CareerMatch | null;

  /** Statistical summary */
  statistics: {
    totalCareers: number;
    qualifyingCount: number;
    averageScore: number;
    scoreDistribution: {
      excellent: number; // 0.8+
      good: number;      // 0.6-0.8
      moderate: number;  // 0.4-0.6
      poor: number;      // <0.4
    };
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_WEIGHTS: MatchingWeights = {
  psychological: 0.35,
  workStyle: 0.25,
  motivation: 0.25,
  constraint: 0.15,
};

const DEFAULT_THRESHOLD = 0.3;

// Thresholds for determining "strong" matches/mismatches
const STRONG_MATCH_THRESHOLD = 0.8;
const STRONG_MISMATCH_THRESHOLD = 0.4;
const TOP_MATCHES_COUNT = 5;

// ============================================================================
// PURE MATCHING FUNCTIONS
// ============================================================================

/**
 * Calculates psychological fit between student and career.
 * Higher score = student's traits align with career requirements.
 *
 * Algorithm:
 *   For each trait: match = 1 - |student - career|
 *   Overall = average of all trait matches
 *   Weight traits equally in V1
 */
export function calculatePsychologicalFit(
  student: StudentPsychology,
  career: PsychologicalProfile
): { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] } {
  const traits: Array<{ key: keyof StudentPsychology; label: string }> = [
    { key: 'analyticalThinking', label: 'Analytical Thinking' },
    { key: 'creativity', label: 'Creativity' },
    { key: 'socialOrientation', label: 'Social Orientation' },
    { key: 'leadership', label: 'Leadership' },
    { key: 'detailOrientation', label: 'Detail Orientation' },
    { key: 'curiosity', label: 'Curiosity' },
    { key: 'competitiveness', label: 'Competitiveness' },
    { key: 'riskTolerance', label: 'Risk Tolerance' },
  ];

  const allMatches: TraitMatch[] = traits.map(({ key, label }) => {
    const studentScore = student[key];
    const careerScore = career[key];

    // Calculate match: inverse of difference
    // Perfect match = 1.0, Complete mismatch = 0.0
    const rawDifference = Math.abs(studentScore - careerScore);
    const matchScore = 1 - rawDifference;

    // Generate explanation
    let explanation: string;
    if (matchScore >= 0.8) {
      explanation = `Strong alignment: You score ${formatScore(studentScore)} and this career requires ${formatScore(careerScore)}`;
    } else if (matchScore >= 0.5) {
      explanation = `Moderate fit: You score ${formatScore(studentScore)} vs career requirement of ${formatScore(careerScore)}`;
    } else {
      explanation = `Potential gap: You score ${formatScore(studentScore)} but this career requires ${formatScore(careerScore)}`;
    }

    return {
      trait: label,
      studentScore,
      careerScore,
      matchScore,
      explanation,
    };
  });

  // Sort by match score
  allMatches.sort((a, b) => b.matchScore - a.matchScore);

  // Split into matches and mismatches
  const matches = allMatches.filter((m) => m.matchScore >= STRONG_MATCH_THRESHOLD);
  const mismatches = allMatches.filter((m) => m.matchScore < STRONG_MISMATCH_THRESHOLD);

  // Calculate overall score as weighted average
  // Weight traits where career requires >0.5 more heavily
  let totalWeight = 0;
  let weightedSum = 0;

  for (const { key } of traits) {
    const careerScore = career[key];
    const studentScore = student[key];
    const matchScore = 1 - Math.abs(studentScore - careerScore);

    // Weight by career importance (higher requirement = more important)
    const weight = 0.5 + careerScore * 0.5; // 0.5 to 1.0
    weightedSum += matchScore * weight;
    totalWeight += weight;
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

  return {
    score: Math.round(score * 1000) / 1000, // Round to 3 decimal places
    matches: matches.slice(0, 3), // Top 3 matches
    mismatches: mismatches.slice(0, 3), // Top 3 mismatches
  };
}

/**
 * Calculates work-style fit between student preferences and career work style.
 *
 * Algorithm:
 *   Compare student preferences to career characteristics
 *   High match when student preference aligns with career reality
 */
export function calculateWorkStyleFit(
  preferences: WorkStylePreference,
  career: WorkStyleProfile
): { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] } {
  const dimensions: Array<{
    key: keyof WorkStylePreference;
    careerKey: keyof WorkStyleProfile;
    label: string;
  }> = [
    { key: 'remoteWork', careerKey: 'remoteWork', label: 'Remote Work' },
    { key: 'officeWork', careerKey: 'officeWork', label: 'Office Work' },
    { key: 'fieldWork', careerKey: 'fieldWork', label: 'Field Work' },
    { key: 'travelComfort', careerKey: 'travelRequirement', label: 'Travel' },
    { key: 'teamPreference', careerKey: 'teamOrientation', label: 'Teamwork' },
    { key: 'structurePreference', careerKey: 'structuredEnvironment', label: 'Structure' },
  ];

  const allMatches: TraitMatch[] = dimensions.map(({ key, careerKey, label }) => {
    const preferenceScore = preferences[key];
    const careerScore = career[careerKey] as number;

    // For work style, we want alignment between preference and reality
    // If student prefers remote (1.0) and career offers remote (1.0) = perfect match
    // If student prefers remote (1.0) but career is office-based (0.0) = mismatch
    const matchScore = 1 - Math.abs(preferenceScore - careerScore);

    let explanation: string;
    if (matchScore >= 0.8) {
      explanation = `Great fit: You prefer ${formatScore(preferenceScore)} ${label.toLowerCase()}, this career offers ${formatScore(careerScore)}`;
    } else if (matchScore >= 0.5) {
      explanation = `Acceptable: You prefer ${formatScore(preferenceScore)} ${label.toLowerCase()}, this career is ${formatScore(careerScore)}`;
    } else {
      explanation = `Mismatch: You prefer ${formatScore(preferenceScore)} ${label.toLowerCase()}, but this career is ${formatScore(careerScore)}`;
    }

    return {
      trait: label,
      studentScore: preferenceScore,
      careerScore,
      matchScore,
      explanation,
    };
  });

  allMatches.sort((a, b) => b.matchScore - a.matchScore);

  const matches = allMatches.filter((m) => m.matchScore >= STRONG_MATCH_THRESHOLD);
  const mismatches = allMatches.filter((m) => m.matchScore < STRONG_MISMATCH_THRESHOLD);

  // Calculate overall score
  const averageScore = allMatches.reduce((sum, m) => sum + m.matchScore, 0) / allMatches.length;

  return {
    score: Math.round(averageScore * 1000) / 1000,
    matches: matches.slice(0, 3),
    mismatches: mismatches.slice(0, 3),
  };
}

/**
 * Calculates motivation fit between student motivations and career rewards.
 *
 * Algorithm:
 *   Weight career rewards by student motivation importance
 *   High match when career delivers what student cares about
 */
export function calculateMotivationFit(
  motivations: Motivations,
  rewards: RewardProfile
): { score: number; matches: MotivationMatch[]; mismatches: MotivationMatch[] } {
  const motivationMap: Array<{
    key: keyof Motivations;
    rewardKey: keyof RewardProfile;
    label: string;
  }> = [
    { key: 'money', rewardKey: 'incomePotential', label: 'Income Potential' },
    { key: 'impact', rewardKey: 'impactPotential', label: 'Impact Potential' },
    { key: 'status', rewardKey: 'statusPotential', label: 'Status Potential' },
    { key: 'freedom', rewardKey: 'freedomPotential', label: 'Freedom Potential' },
    { key: 'stability', rewardKey: 'stabilityPotential', label: 'Stability Potential' },
  ];

  const allMatches: MotivationMatch[] = motivationMap.map(({ key, rewardKey, label }) => {
    const studentImportance = motivations[key];
    const careerReward = rewards[rewardKey];

    // If student cares deeply about this motivation, career must deliver
    // If student doesn't care, career's score matters less

    // Match calculation:
    // - If student importance is high (>0.7), career reward should be high
    // - If student importance is low (<0.3), career reward matters less
    // - Weight the match by student importance

    let matchScore: number;

    if (studentImportance >= 0.6) {
      // Student cares: career should deliver at least similar level
      matchScore = careerReward >= studentImportance - 0.2 ? 1 : careerReward / studentImportance;
    } else if (studentImportance <= 0.3) {
      // Student doesn't care: any level is fine, but low career score is slightly preferred
      matchScore = 1 - Math.abs(careerReward - 0.5) * 0.2;
    } else {
      // Moderate importance: simple inverse difference
      matchScore = 1 - Math.abs(studentImportance - careerReward);
    }

    // Clamp to 0-1
    matchScore = Math.max(0, Math.min(1, matchScore));

    let explanation: string;
    if (studentImportance >= 0.6) {
      if (matchScore >= 0.8) {
        explanation = `You highly value ${label.toLowerCase()} (${formatScore(studentImportance)}) and this career delivers (${formatScore(careerReward)})`;
      } else {
        explanation = `You highly value ${label.toLowerCase()} (${formatScore(studentImportance)}) but this career only offers ${formatScore(careerReward)}`;
      }
    } else if (studentImportance <= 0.3) {
      explanation = `${label} isn't a priority for you (${formatScore(studentImportance)}), career offers ${formatScore(careerReward)}`;
    } else {
      explanation = `You moderately value ${label.toLowerCase()} (${formatScore(studentImportance)}), career offers ${formatScore(careerReward)}`;
    }

    return {
      motivation: label,
      studentImportance,
      careerReward,
      matchScore,
      explanation,
    };
  });

  allMatches.sort((a, b) => b.matchScore - a.matchScore);

  const matches = allMatches.filter((m) => m.matchScore >= STRONG_MATCH_THRESHOLD);
  const mismatches = allMatches.filter((m) => m.matchScore < STRONG_MISMATCH_THRESHOLD);

  // Weighted average by student importance
  let totalWeight = 0;
  let weightedSum = 0;

  for (const match of allMatches) {
    const weight = match.studentImportance + 0.2; // Ensure even low importance has some weight
    weightedSum += match.matchScore * weight;
    totalWeight += weight;
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

  return {
    score: Math.round(score * 1000) / 1000,
    matches: matches.slice(0, 3),
    mismatches: mismatches.slice(0, 3),
  };
}

/**
 * Calculates constraint fit between student constraints and career requirements.
 *
 * Algorithm:
 *   Check each constraint against career IndiaReality
 *   Return pass/fail for each constraint + overall score
 */
export function calculateConstraintFit(
  constraints: RealityConstraints,
  career: Career
): { score: number; results: ConstraintResult[] } {
  const results: ConstraintResult[] = [];

  // Financial constraints
  const financial = constraints.financial;
  const indiaReality = career.indiaReality;

  // Coaching dependency check
  if (indiaReality.coachingDependency >= 0.7) {
    if (financial.canAffordCoaching) {
      results.push({
        constraint: 'Coaching Access',
        isSatisfied: true,
        severity: 0,
        explanation: `This career requires coaching, and you can afford it`,
      });
    } else {
      results.push({
        constraint: 'Coaching Access',
        isSatisfied: false,
        severity: 0.8,
        explanation: `This career typically requires coaching (dependency: ${formatScore(indiaReality.coachingDependency)}), but you indicated you cannot afford it`,
      });
    }
  } else if (indiaReality.coachingDependency >= 0.4) {
    results.push({
      constraint: 'Coaching Access',
      isSatisfied: true,
      severity: 0,
      explanation: `Coaching is helpful but not essential for this career`,
    });
  }

  // Urban advantage check
  if (indiaReality.urbanAdvantage >= 0.7) {
    if (constraints.geographic.locationType === 'metro_tier_1') {
      results.push({
        constraint: 'Urban Location',
        isSatisfied: true,
        severity: 0,
        explanation: `You're in a metro/Tier-1 city, which is advantageous for this career`,
      });
    } else if (!constraints.geographic.willingToRelocate) {
      results.push({
        constraint: 'Urban Location',
        isSatisfied: false,
        severity: 0.7,
        explanation: `This career strongly favors Tier-1 cities, but you're not willing to relocate`,
      });
    } else {
      results.push({
        constraint: 'Urban Location',
        isSatisfied: true,
        severity: 0.2,
        explanation: `This career favors Tier-1 cities, but you're willing to relocate`,
      });
    }
  }

  // English dependency check
  if (indiaReality.englishDependency >= 0.7) {
    const englishLevels = ['native_only', 'native_and_hindi', 'basic_english', 'functional_english', 'fluent_english'];
    const studentLevel = constraints.accessibility.languageComfort;
    const levelIndex = englishLevels.indexOf(studentLevel);

    if (levelIndex >= 3) {
      // functional_english or fluent
      results.push({
        constraint: 'English Proficiency',
        isSatisfied: true,
        severity: 0,
        explanation: `Your English proficiency is sufficient for this career`,
      });
    } else {
      results.push({
        constraint: 'English Proficiency',
        isSatisfied: false,
        severity: 0.6,
        explanation: `This career requires strong English (${formatScore(indiaReality.englishDependency)}), consider improving your skills`,
      });
    }
  }

  // Migration requirement check
  if (indiaReality.migrationRequirement >= 0.7) {
    if (constraints.geographic.willingToRelocate) {
      results.push({
        constraint: 'Relocation',
        isSatisfied: true,
        severity: 0.1,
        explanation: `This career requires migration, but you're willing to relocate`,
      });
    } else {
      results.push({
        constraint: 'Relocation',
        isSatisfied: false,
        severity: 0.9,
        explanation: `This career requires migration to specific locations, but you're not willing to relocate`,
      });
    }
  }

  // Calculate overall constraint score
  if (results.length === 0) {
    return { score: 1.0, results: [] };
  }

  const blockingConstraints = results.filter((r) => !r.isSatisfied && r.severity >= 0.7);
  const minorIssues = results.filter((r) => !r.isSatisfied && r.severity < 0.7);

  if (blockingConstraints.length > 0) {
    // Significant constraint violations
    const severitySum = blockingConstraints.reduce((sum, r) => sum + r.severity, 0);
    const score = Math.max(0, 1 - severitySum / (blockingConstraints.length * 2));
    return { score: Math.round(score * 1000) / 1000, results };
  } else if (minorIssues.length > 0) {
    // Minor issues only
    const severitySum = minorIssues.reduce((sum, r) => sum + r.severity, 0);
    const score = 1 - severitySum * 0.2;
    return { score: Math.round(score * 1000) / 1000, results };
  } else {
    return { score: 1.0, results };
  }
}

// ============================================================================
// MAIN MATCHING ENGINE
// ============================================================================

/**
 * Matches a student against a single career.
 * Pure function - deterministic, no side effects.
 */
export function matchCareer(
  input: MatchingInput,
  career: Career
): CareerMatch {
  const weights = input.weights ?? DEFAULT_WEIGHTS;

  // Calculate all dimension scores
  const psychFit = calculatePsychologicalFit(input.psychology, career.psychologicalProfile);
  const workStyleFit = calculateWorkStyleFit(input.workStylePreference, career.workStyle);
  const motivationFit = calculateMotivationFit(input.motivations, career.rewardProfile);
  const constraintFit = calculateConstraintFit(input.constraints, career);

  // Calculate weighted overall score
  const overallScore =
    psychFit.score * weights.psychological +
    workStyleFit.score * weights.workStyle +
    motivationFit.score * weights.motivation +
    constraintFit.score * weights.constraint;

  // Generate reasoning
  const reasoning = generateReasoning(
    psychFit,
    workStyleFit,
    motivationFit,
    constraintFit,
    overallScore,
    career
  );

  // Generate insights
  const insights = generateInsights(psychFit, workStyleFit, motivationFit, constraintFit, career);

  // Build explanation
  const explanation: MatchExplanation = {
    overallScore: Math.round(overallScore * 1000) / 1000,
    psychologicalFit: {
      score: psychFit.score,
      strongestMatches: psychFit.matches,
      strongestMismatches: psychFit.mismatches,
      summary: generatePsychSummary(psychFit),
    },
    workStyleFit: {
      score: workStyleFit.score,
      strongestMatches: workStyleFit.matches,
      strongestMismatches: workStyleFit.mismatches,
      summary: generateWorkStyleSummary(workStyleFit),
    },
    motivationFit: {
      score: motivationFit.score,
      strongestMatches: motivationFit.matches,
      strongestMismatches: motivationFit.mismatches,
      summary: generateMotivationSummary(motivationFit),
    },
    constraintFit: {
      score: constraintFit.score,
      satisfied: constraintFit.results.filter((r) => r.isSatisfied),
      violated: constraintFit.results.filter((r) => !r.isSatisfied),
      summary: generateConstraintSummary(constraintFit),
    },
    reasoning,
    insights,
  };

  return {
    careerId: career.id,
    careerSlug: career.slug,
    careerName: career.name,
    score: Math.round(overallScore * 1000) / 1000,
    explanation,
  };
}

/**
 * Matches a student against multiple careers.
 * Pure function - deterministic, no side effects.
 */
export function matchAllCareers(
  input: MatchingInput,
  careers: Career[]
): MatchingResult {
  const threshold = input.minimumThreshold ?? DEFAULT_THRESHOLD;

  // Calculate matches for all careers
  const allMatches = careers.map((career) => matchCareer(input, career));

  // Sort by score (descending)
  allMatches.sort((a, b) => b.score - a.score);

  // Filter qualifying matches
  const qualifyingMatches = allMatches.filter((m) => m.score >= threshold);

  // Calculate statistics
  const scores = allMatches.map((m) => m.score);
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  const statistics = {
    totalCareers: allMatches.length,
    qualifyingCount: qualifyingMatches.length,
    averageScore: Math.round(averageScore * 1000) / 1000,
    scoreDistribution: {
      excellent: allMatches.filter((m) => m.score >= 0.8).length,
      good: allMatches.filter((m) => m.score >= 0.6 && m.score < 0.8).length,
      moderate: allMatches.filter((m) => m.score >= 0.4 && m.score < 0.6).length,
      poor: allMatches.filter((m) => m.score < 0.4).length,
    },
  };

  return {
    matches: allMatches,
    topMatches: allMatches.slice(0, TOP_MATCHES_COUNT),
    qualifyingMatches,
    bestMatch: allMatches.length > 0 ? allMatches[0] : null,
    statistics,
  };
}

// ============================================================================
// EXPLANATION GENERATORS
// ============================================================================

function generateReasoning(
  psychFit: { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] },
  workStyleFit: { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] },
  motivationFit: { score: number; matches: MotivationMatch[]; mismatches: MotivationMatch[] },
  constraintFit: { score: number; results: ConstraintResult[] },
  overallScore: number,
  career: Career
): string[] {
  const reasoning: string[] = [];

  // Overall assessment
  if (overallScore >= 0.8) {
    reasoning.push(`This is an excellent match (${Math.round(overallScore * 100)}% overall)`);
  } else if (overallScore >= 0.6) {
    reasoning.push(`This is a good match (${Math.round(overallScore * 100)}% overall)`);
  } else if (overallScore >= 0.4) {
    reasoning.push(`This is a moderate match (${Math.round(overallScore * 100)}% overall)`);
  } else {
    reasoning.push(`This career may not be the best fit (${Math.round(overallScore * 100)}% overall)`);
  }

  // Psychological fit reasoning
  if (psychFit.score >= 0.8) {
    reasoning.push(`Your personality traits strongly align with this career (${Math.round(psychFit.score * 100)}% fit)`);
  } else if (psychFit.score >= 0.6) {
    reasoning.push(`Your personality is reasonably compatible (${Math.round(psychFit.score * 100)}% fit)`);
  } else {
    reasoning.push(`Your personality traits differ significantly from typical professionals in this field (${Math.round(psychFit.score * 100)}% fit)`);
  }

  // Motivation fit reasoning
  if (motivationFit.score >= 0.8) {
    reasoning.push(`This career delivers what you value most (${Math.round(motivationFit.score * 100)}% motivation fit)`);
  } else if (motivationFit.score < 0.5) {
    reasoning.push(`This career may not satisfy your key motivations (${Math.round(motivationFit.score * 100)}% motivation fit)`);
  }

  // Constraint reasoning
  const violatedConstraints = constraintFit.results.filter((r) => !r.isSatisfied);
  if (violatedConstraints.length > 0) {
    const blocking = violatedConstraints.filter((r) => r.severity >= 0.7);
    if (blocking.length > 0) {
      reasoning.push(`⚠️ Important: ${blocking[0].explanation}`);
    }
  }

  return reasoning;
}

function generateInsights(
  psychFit: { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] },
  workStyleFit: { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] },
  motivationFit: { score: number; matches: MotivationMatch[]; mismatches: MotivationMatch[] },
  constraintFit: { score: number; results: ConstraintResult[] },
  career: Career
): string[] {
  const insights: string[] = [];

  // Strongest match insight
  if (psychFit.matches.length > 0) {
    const topMatch = psychFit.matches[0];
    insights.push(`Strongest match: ${topMatch.trait} - ${topMatch.explanation}`);
  }

  // Key mismatch insight
  if (psychFit.mismatches.length > 0) {
    const topMismatch = psychFit.mismatches[0];
    insights.push(`Key gap: ${topMismatch.trait} - ${topMismatch.explanation}`);
  }

  // Motivation insight
  if (motivationFit.mismatches.length > 0) {
    const mm = motivationFit.mismatches[0];
    if (mm.studentImportance >= 0.6) {
      insights.push(`Important: You highly value ${mm.motivation.toLowerCase()}, but this career scores ${formatScore(mm.careerReward)}`);
    }
  }

  // Risk insight
  if (career.riskProfile.burnoutRisk >= 0.7) {
    insights.push(`⚠️ Note: This career has high burnout risk (${formatScore(career.riskProfile.burnoutRisk)})`);
  }
  if (career.riskProfile.automationRisk >= 0.7) {
    insights.push(`⚠️ Note: This career faces high automation risk (${formatScore(career.riskProfile.automationRisk)})`);
  }

  return insights;
}

function generatePsychSummary(psychFit: { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] }): string {
  if (psychFit.score >= 0.8) {
    return `Your psychological profile is highly compatible with this career. ${psychFit.matches.length} traits show strong alignment.`;
  } else if (psychFit.score >= 0.6) {
    return `Your personality is generally compatible. ${psychFit.matches.length} strong matches, ${psychFit.mismatches.length} areas to consider.`;
  } else {
    return `Your traits differ from typical professionals in this field. Consider whether you can develop these characteristics.`;
  }
}

function generateWorkStyleSummary(workStyleFit: { score: number; matches: TraitMatch[]; mismatches: TraitMatch[] }): string {
  if (workStyleFit.score >= 0.8) {
    return `This career's work environment aligns well with your preferences.`;
  } else if (workStyleFit.score >= 0.6) {
    return `The work style is reasonably compatible with some adjustments needed.`;
  } else {
    return `The day-to-day work style differs significantly from your preferences. Consider if this is acceptable.`;
  }
}

function generateMotivationSummary(motivationFit: { score: number; matches: MotivationMatch[]; mismatches: MotivationMatch[] }): string {
  if (motivationFit.score >= 0.8) {
    return `This career delivers what you value most in your professional life.`;
  } else if (motivationFit.score >= 0.6) {
    return `The career satisfies most of your key motivations with some tradeoffs.`;
  } else {
    return `There may be a gap between what you want and what this career offers.`;
  }
}

function generateConstraintSummary(constraintFit: { score: number; results: ConstraintResult[] }): string {
  const violated = constraintFit.results.filter((r) => !r.isSatisfied);
  const satisfied = constraintFit.results.filter((r) => r.isSatisfied);

  if (violated.length === 0) {
    return `All practical constraints are satisfied for this career.`;
  } else if (violated.every((r) => r.severity < 0.5)) {
    return `Minor constraint considerations (${violated.length}), but generally feasible.`;
  } else {
    const blocking = violated.filter((r) => r.severity >= 0.7);
    return `${blocking.length} significant constraint(s) need attention. Review carefully.`;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

// ============================================================================
// DEFAULT WORK STYLE PREFERENCES (for convenience)
// ============================================================================

/**
 * Creates neutral work style preferences (middle of the road).
 */
export function createNeutralWorkStylePreference(): WorkStylePreference {
  return {
    remoteWork: 0.5,
    officeWork: 0.5,
    fieldWork: 0.3,
    travelComfort: 0.5,
    teamPreference: 0.5,
    structurePreference: 0.5,
  };
}

/**
 * Creates work style preferences from student profile.
 * Infers preferences based on psychology traits.
 */
export function inferWorkStylePreference(profile: StudentProfile): WorkStylePreference {
  return {
    // Higher creativity -> preference for remote/flexible
    remoteWork: Math.max(0.3, Math.min(0.9, profile.psychology.creativity * 0.7 + 0.3)),

    // Higher social orientation -> preference for office
    officeWork: Math.max(0.3, Math.min(0.9, profile.psychology.socialOrientation * 0.6 + 0.3)),

    // Higher curiosity -> more open to field work
    fieldWork: Math.max(0.1, Math.min(0.7, profile.psychology.curiosity * 0.5)),

    // Higher risk tolerance -> comfortable with travel
    travelComfort: Math.max(0.2, Math.min(0.9, profile.psychology.riskTolerance * 0.8)),

    // Social orientation drives team preference
    teamPreference: Math.max(0.2, Math.min(0.9, profile.psychology.socialOrientation)),

    // Detail orientation drives structure preference
    structurePreference: Math.max(0.3, Math.min(0.9, profile.psychology.detailOrientation * 0.8 + 0.2)),
  };
}

// ============================================================================
// HIGH-LEVEL API
// ============================================================================

/**
 * High-level matching function that takes a complete student profile and matches against careers.
 * Automatically infers work style preferences from psychology profile.
 */
export function matchStudentToCareers(
  profile: StudentProfile,
  careers: Career[],
  options?: {
    minimumThreshold?: number;
    weights?: MatchingWeights;
    useInferredWorkStyle?: boolean;
    workStylePreference?: WorkStylePreference;
  }
): MatchingResult {
  const workStylePreference =
    options?.workStylePreference ??
    (options?.useInferredWorkStyle !== false ? inferWorkStylePreference(profile) : createNeutralWorkStylePreference());

  const input: MatchingInput = {
    psychology: profile.psychology,
    motivations: profile.motivations,
    constraints: profile.constraints,
    workStylePreference,
    minimumThreshold: options?.minimumThreshold,
    weights: options?.weights,
  };

  return matchAllCareers(input, careers);
}
