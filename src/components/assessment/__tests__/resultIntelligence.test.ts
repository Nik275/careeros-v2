import { describe, expect, it } from 'vitest';
import {
  generateCareerResultIntelligence,
  type ResultAssessmentData,
} from '../resultIntelligence';

const builderPersona: ResultAssessmentData = {
  psychology: {
    motivations: ['creativity', 'independence', 'mastery'],
    strengths: ['practical', 'analytical', 'creative'],
    personalityTraits: ['independent'],
    values: ['growth', 'financial', 'creativity'],
    lifestylePreferences: ['remote'],
  },
};

const stabilityPersona: ResultAssessmentData = {
  psychology: {
    motivations: ['security'],
    strengths: ['organizing', 'analytical'],
    personalityTraits: ['structured'],
    values: ['stability', 'worklife'],
    lifestylePreferences: ['office'],
  },
};

const peopleImpactPersona: ResultAssessmentData = {
  psychology: {
    motivations: ['impact', 'recognition'],
    strengths: ['social', 'leading'],
    personalityTraits: ['collaborative'],
    values: ['purpose', 'growth'],
    lifestylePreferences: ['field'],
  },
};

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

  it('includes recommendation explanation fields required by the staging result contract', () => {
    const result = generateCareerResultIntelligence(peopleImpactPersona);

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
      expect(recommendation.tradeoff.length).toBeGreaterThan(20);
      expect(recommendation.nextStep.length).toBeGreaterThan(20);
      expect(recommendation.avoidIf.length).toBeGreaterThan(20);
      expect(recommendation.salaryRange).toMatch(/^₹/);
      expect(recommendation.salaryRange).toContain('LPA');
    }
  });

  it('can generate a complete result from synthetic assessment answers', () => {
    const result = generateCareerResultIntelligence({
      psychology: {
        motivations: ['creativity'],
        strengths: ['analytical'],
        personalityTraits: ['structured'],
        values: ['worklife'],
        lifestylePreferences: ['hybrid'],
      },
    });

    expect(result.archetype.name).toBeTruthy();
    expect(result.recommendations).toHaveLength(3);
    expect(result.nextSevenDayAction).toContain('7 days');
    expect(result.comebackPrompt).toContain('Come back');
  });
});
