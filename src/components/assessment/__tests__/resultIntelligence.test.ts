import { describe, expect, it } from 'vitest';
import {
  ASSESSMENT_QUESTIONS,
  createEmptyAssessmentPsychologyData,
  type AssessmentPsychologyData,
  type StudentStage,
} from '../assessmentQuestions';
import {
  generateCareerResultIntelligence,
  type ResultAssessmentData,
} from '../resultIntelligence';

function createPersona(
  overrides: Partial<AssessmentPsychologyData>,
  studentStage: StudentStage = 'college_undergrad',
): ResultAssessmentData {
  return {
    studentStage,
    psychology: {
      ...createEmptyAssessmentPsychologyData(),
      motivations: ['mastery'],
      strengths: ['analytical'],
      personalityTraits: ['structured'],
      values: ['growth'],
      lifestylePreferences: ['hybrid'],
      financialPressure: ['earning_1_2_years'],
      familyExpectations: ['family_somewhat'],
      riskTolerance: ['risk_balanced'],
      academicConfidence: ['academic_steady'],
      learningDiscipline: ['learning_weekly'],
      socialEnergy: ['social_small_team'],
      ambiguityTolerance: ['ambiguity_milestones'],
      locationFlexibility: ['location_hybrid_nearby'],
      skillReadiness: ['proof_coursework'],
      decisionTension: ['regret_wrong_fit'],
      ...overrides,
    },
  };
}

const builderPersona = createPersona({
  motivations: ['creativity', 'independence', 'mastery'],
  strengths: ['practical', 'analytical', 'creative'],
  personalityTraits: ['independent'],
  values: ['growth', 'financial'],
  lifestylePreferences: ['remote'],
  financialPressure: ['explore_longer'],
  familyExpectations: ['self_directed'],
  riskTolerance: ['risk_founder'],
  academicConfidence: ['academic_practical'],
  learningDiscipline: ['learning_daily'],
  socialEnergy: ['social_solo'],
  ambiguityTolerance: ['ambiguity_curious'],
  locationFlexibility: ['location_remote'],
  skillReadiness: ['proof_shipped'],
  decisionTension: ['regret_missed_potential'],
});

const stabilityPersona = createPersona({
  motivations: ['security'],
  strengths: ['organizing', 'analytical'],
  personalityTraits: ['structured'],
  values: ['stability', 'worklife'],
  lifestylePreferences: ['office'],
  financialPressure: ['earning_6_months'],
  familyExpectations: ['family_very_strong'],
  riskTolerance: ['risk_stable'],
  academicConfidence: ['academic_strong'],
  learningDiscipline: ['learning_needs_structure'],
  socialEnergy: ['social_solo'],
  ambiguityTolerance: ['ambiguity_avoid'],
  locationFlexibility: ['location_family_close'],
  skillReadiness: ['proof_coursework'],
  decisionTension: ['regret_disappoint_family'],
});

const peopleImpactPersona = createPersona({
  motivations: ['impact', 'recognition'],
  strengths: ['social', 'organizing'],
  personalityTraits: ['collaborative'],
  values: ['purpose', 'growth'],
  lifestylePreferences: ['field'],
  financialPressure: ['earning_1_2_years'],
  familyExpectations: ['family_somewhat'],
  riskTolerance: ['risk_balanced'],
  academicConfidence: ['academic_steady'],
  learningDiscipline: ['learning_deadline'],
  socialEnergy: ['social_one_on_one'],
  ambiguityTolerance: ['ambiguity_milestones'],
  locationFlexibility: ['location_hybrid_nearby'],
  skillReadiness: ['proof_internship'],
  decisionTension: ['regret_wrong_fit'],
});

describe('assessment question contract', () => {
  it('exposes a 15-question MVP assessment with one tracked signal group per question', () => {
    expect(ASSESSMENT_QUESTIONS).toHaveLength(15);
    expect(ASSESSMENT_QUESTIONS[0].id).toBe('motivations');
    expect(ASSESSMENT_QUESTIONS[14].id).toBe('decisionTension');

    const ids = ASSESSMENT_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(15);

    for (const question of ASSESSMENT_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(4);
      expect(question.options.length).toBeLessThanOrEqual(5);
    }
  });

  it('captures the required depth areas without exact income or sensitive identity questions', () => {
    const ids = ASSESSMENT_QUESTIONS.map((question) => question.id);
    expect(ids).toEqual([
      'motivations',
      'strengths',
      'personalityTraits',
      'values',
      'lifestylePreferences',
      'financialPressure',
      'familyExpectations',
      'riskTolerance',
      'academicConfidence',
      'learningDiscipline',
      'socialEnergy',
      'ambiguityTolerance',
      'locationFlexibility',
      'skillReadiness',
      'decisionTension',
    ]);

    const questionText = ASSESSMENT_QUESTIONS
      .flatMap((question) => [
        question.question,
        question.subtext ?? '',
        ...question.options.flatMap((option) => [option.label, option.description ?? '']),
      ])
      .join(' ')
      .toLowerCase();

    expect(questionText).not.toContain('exact income');
    expect(questionText).not.toContain('family income');
    expect(questionText).not.toContain('caste');
    expect(questionText).not.toContain('religion');
  });
});

describe('generateCareerResultIntelligence', () => {
  it('generates different recommendation sets for different synthetic answer patterns', () => {
    const builder = generateCareerResultIntelligence(builderPersona);
    const stability = generateCareerResultIntelligence(stabilityPersona);
    const peopleImpact = generateCareerResultIntelligence(peopleImpactPersona);

    const builderTitles = builder.recommendations.map((career) => career.title);
    const stabilityTitles = stability.recommendations.map((career) => career.title);
    const peopleImpactTitles = peopleImpact.recommendations.map((career) => career.title);

    expect(builderTitles).not.toEqual(stabilityTitles);
    expect(stabilityTitles).not.toEqual(peopleImpactTitles);
    expect(new Set([builderTitles[0], stabilityTitles[0], peopleImpactTitles[0]]).size).toBeGreaterThan(1);
  });

  it('keeps Class 10 output direction-led instead of hard job-title led', () => {
    const result = generateCareerResultIntelligence(createPersona({
      motivations: ['mastery', 'security'],
      strengths: ['analytical', 'organizing'],
      personalityTraits: ['structured'],
      values: ['stability'],
      financialPressure: ['explore_longer'],
      familyExpectations: ['family_very_strong'],
      riskTolerance: ['risk_stable'],
      academicConfidence: ['academic_steady'],
      skillReadiness: ['proof_starting'],
    }, 'class_9_10'));

    const titles = result.recommendations.map((career) => career.title);

    expect(result.stageCopy.primaryPathLabel).toBe('Your direction');
    expect(titles.every((title) => title.includes('Direction'))).toBe(true);
    expect(titles).not.toContain('Software Engineer');
    expect(titles).not.toContain('AI Automation Builder');
    expect(result.nextSevenDayAction).toContain('beginner activity');
    expect(result.summary.whatNotIgnore).toContain('subjects');
    expect(result.stageCopy.schoolDecisionReminder).toContain('not a final career decision');
  });

  it('allows a college builder to receive tech recommendations when the signals justify it', () => {
    const result = generateCareerResultIntelligence(builderPersona);
    const titles = result.recommendations.map((career) => career.title);

    expect(titles.some((title) => ['Software Engineer', 'AI Automation Builder', 'Cloud/DevOps Engineer'].includes(title))).toBe(true);
    expect(result.stageCopy.primaryPathLabel).toBe('Recommended path');
  });

  it('does not force a stability and family-pressure persona into IT recommendations', () => {
    const result = generateCareerResultIntelligence(stabilityPersona);
    const titles = result.recommendations.map((career) => career.title);

    expect(titles).toContain('Government Exam Path');
    expect(titles).toContain('Finance / Accounting Path');
    expect(titles).not.toContain('AI Automation Builder');
    expect(titles).not.toContain('Cloud/DevOps Engineer');
  });

  it('elevates people-impact non-IT recommendations for people-facing signals', () => {
    const result = generateCareerResultIntelligence(peopleImpactPersona);
    const titles = result.recommendations.map((career) => career.title);

    expect(titles.some((title) => [
      'Teaching / Mentoring Path',
      'Sales / Business Development',
      'UX Researcher',
      'Healthcare-Adjacent Tech / Operations',
    ].includes(title))).toBe(true);
    expect(titles).not.toEqual(['Software Engineer', 'AI Automation Builder', 'Product Manager']);
  });

  it('changes the same answer pattern across student stages', () => {
    const classTen = generateCareerResultIntelligence(createPersona(builderPersona.psychology, 'class_9_10'));
    const college = generateCareerResultIntelligence(createPersona(builderPersona.psychology, 'college_undergrad'));

    expect(classTen.recommendations[0].title).not.toBe(college.recommendations[0].title);
    expect(classTen.recommendations[0].title).toContain('Direction');
    expect(college.recommendations.map((career) => career.title)).toContain('AI Automation Builder');
    expect(classTen.recommendations[0].salaryRange).not.toContain('LPA');
    expect(college.recommendations[0].salaryRange).toContain('LPA');
  });

  it('uses India salary language and never emits USD symbols', () => {
    const result = generateCareerResultIntelligence(builderPersona);
    const serialized = JSON.stringify(result);

    expect(serialized).toContain('₹');
    expect(serialized).toContain('LPA');
    expect(serialized).not.toContain('$');
  });

  it('does not always return Product Manager, UX Researcher, and Strategy Consultant as the default top three', () => {
    const result = generateCareerResultIntelligence(stabilityPersona);
    const titles = result.recommendations.map((career) => career.title);

    expect(titles).not.toEqual(['Product Manager', 'UX Researcher', 'Strategy Consultant']);
    expect(titles).toContain('Government Exam Path');
  });

  it('includes recommendation explanation fields and a clarity confidence label', () => {
    const result = generateCareerResultIntelligence(peopleImpactPersona);

    expect(['Initial Clarity', 'Strong Clarity', 'Needs More Exploration']).toContain(result.confidence.label);
    expect(result.confidence.score).toBeGreaterThan(0);
    expect(result.confidence.rationale.length).toBeGreaterThan(20);
    expect(result.summary.decisionPattern.length).toBeGreaterThan(20);
    expect(result.summary.strongestSignals.length).toBeGreaterThan(10);
    expect(result.summary.hiddenTension.length).toBeGreaterThan(20);
    expect(result.summary.whatNotIgnore.length).toBeGreaterThan(20);
    expect(result.paths.naturalFit.title).toBeTruthy();
    expect(result.paths.longTermOutcome.title).toBeTruthy();
    expect(result.paths.balanced.title).toBeTruthy();

    for (const recommendation of result.recommendations) {
      expect(recommendation.whyFits.length).toBeGreaterThan(20);
      expect(recommendation.answerPattern.length).toBeGreaterThan(20);
      expect(recommendation.answerPattern).not.toContain('Triggered by');
      expect(recommendation.answerPattern).toMatch(/^Your answers/);
      expect(recommendation.tradeoff.length).toBeGreaterThan(20);
      expect(recommendation.nextStep.length).toBeGreaterThan(20);
      expect(recommendation.avoidIf.length).toBeGreaterThan(20);
      expect(recommendation.salaryRange).toMatch(/^₹/);
      expect(recommendation.salaryRange).toContain('LPA');
    }
  });

  it('changes salary guidance and tradeoffs when earning urgency is high', () => {
    const immediate = generateCareerResultIntelligence(createPersona({
      financialPressure: ['earning_now'],
      riskTolerance: ['risk_stable'],
      decisionTension: ['regret_low_income'],
    }));
    const longerRunway = generateCareerResultIntelligence(createPersona({
      financialPressure: ['explore_longer'],
      riskTolerance: ['risk_high_growth'],
      decisionTension: ['regret_missed_potential'],
    }));

    expect(JSON.stringify(immediate)).toContain('earning urgency');
    expect(immediate.nextSevenDayAction).toContain('paid entry routes');
    expect(JSON.stringify(immediate.recommendations)).toContain('paid entry roles');
    expect(JSON.stringify(longerRunway.recommendations)).toContain('longer skill-building runway');
  });

  it('changes warnings and next steps when family pressure is high', () => {
    const highFamilyPressure = generateCareerResultIntelligence(createPersona({
      familyExpectations: ['family_very_strong'],
      decisionTension: ['regret_disappoint_family'],
    }));
    const selfDirected = generateCareerResultIntelligence(createPersona({
      familyExpectations: ['self_directed'],
      decisionTension: ['regret_missed_potential'],
    }));

    expect(highFamilyPressure.nextSevenDayAction).toContain('family-facing explanation');
    expect(JSON.stringify(highFamilyPressure.recommendations)).toContain('Family expectations');
    expect(highFamilyPressure.summary.hiddenTension).toContain('Family expectations');
    expect(selfDirected.nextSevenDayAction).not.toContain('family-facing explanation');
  });

  it('changes path recommendations when risk tolerance changes', () => {
    const stableRisk = generateCareerResultIntelligence(createPersona({
      motivations: ['security'],
      values: ['stability'],
      riskTolerance: ['risk_stable'],
      ambiguityTolerance: ['ambiguity_avoid'],
    }));
    const founderRisk = generateCareerResultIntelligence(createPersona({
      motivations: ['creativity', 'independence'],
      values: ['financial', 'growth'],
      riskTolerance: ['risk_founder'],
      ambiguityTolerance: ['ambiguity_curious'],
      skillReadiness: ['proof_shipped'],
    }));

    expect(stableRisk.paths.naturalFit.title).not.toBe(founderRisk.paths.naturalFit.title);
    expect(stableRisk.recommendations.map((career) => career.title)).toContain('Government Exam Path');
    expect(founderRisk.recommendations.map((career) => career.title)).toContain('Founder / Freelancer Path');
  });

  it('lowers confidence when the signal pattern is incomplete', () => {
    const incomplete = generateCareerResultIntelligence({
      psychology: createEmptyAssessmentPsychologyData(),
    });
    const complete = generateCareerResultIntelligence(builderPersona);

    expect(incomplete.confidence.label).toBe('Needs More Exploration');
    expect(complete.confidence.score).toBeGreaterThan(incomplete.confidence.score);
  });

  it('can generate a complete result from synthetic 15-question assessment answers', () => {
    const result = generateCareerResultIntelligence(createPersona({
      motivations: ['creativity'],
      strengths: ['analytical'],
      personalityTraits: ['structured'],
      values: ['worklife'],
      lifestylePreferences: ['hybrid'],
    }));

    expect(result.archetype.name).toBeTruthy();
    expect(result.recommendations).toHaveLength(3);
    expect(result.nextSevenDayAction).toContain('7 days');
    expect(result.comebackPrompt).toContain('Come back');
  });
});
