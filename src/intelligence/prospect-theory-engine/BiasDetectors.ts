/**
 * CareerOS Prospect Theory & Cognitive Bias Engine - Bias Detectors
 *
 * Detects various cognitive biases from student data.
 */

import type {
  BiasSignal,
  BiasType,
  BiasSignalSource,
  BiasDetectionInput,
  ProspectTheoryConfig,
  RiskPerception,
} from './types';

/**
 * Base class for bias detectors.
 */
abstract class BiasDetector {
  protected config: ProspectTheoryConfig;

  constructor(config: ProspectTheoryConfig) {
    this.config = config;
  }

  abstract detect(input: BiasDetectionInput): BiasSignal[];
  abstract getBiasType(): BiasType;

  protected createSignal(
    strength: number,
    source: BiasSignalSource,
    description: string,
    data: Record<string, unknown>,
    context: BiasSignal['context']
  ): BiasSignal {
    return {
      id: `${this.getBiasType()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      biasType: this.getBiasType(),
      source,
      strength: Math.max(0, Math.min(1, strength)),
      timestamp: Date.now(),
      evidence: {
        description,
        data,
      },
      context,
    };
  }
}

/**
 * Detects loss aversion - preference for avoiding losses over acquiring gains.
 */
export class LossAversionDetector extends BiasDetector {
  getBiasType(): BiasType {
    return 'lossAversion';
  }

  detect(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Check if student avoids high-upside paths due to downside risk
    for (const choice of input.careerChoices) {
      if (choice.utility > 70 && choice.rank > 3) {
        // High utility but low rank suggests avoiding due to risk
        const rationale = choice.rationale?.toLowerCase() || '';

        if (
          rationale.includes('risk') ||
          rationale.includes('safe') ||
          rationale.includes('stable') ||
          rationale.includes('secure')
        ) {
          signals.push(
            this.createSignal(
              0.7,
              'careerChoice',
              `Avoiding high-upside path (${choice.careerId}) due to perceived risk`,
              { careerId: choice.careerId, utility: choice.utility, rank: choice.rank },
              { careerId: choice.careerId, situation: 'career_ranking' }
            )
          );
        }
      }
    }

    // Check assessment responses for risk-averse patterns
    if (input.assessmentResponses) {
      const riskQuestions = input.assessmentResponses.filter(
        (r) => r.category === 'risk_tolerance' || r.category === 'decision_making'
      );

      const riskAverseCount = riskQuestions.filter((r) => {
        const response = String(r.response).toLowerCase();
        return (
          response.includes('avoid') ||
          response.includes('safe') ||
          response.includes('secure') ||
          response.includes('not willing')
        );
      }).length;

      if (riskQuestions.length > 0) {
        const ratio = riskAverseCount / riskQuestions.length;
        if (ratio > 0.6) {
          signals.push(
            this.createSignal(
              ratio,
              'assessment',
              `${Math.round(ratio * 100)}% of risk responses indicate loss aversion`,
              { riskAverseCount, totalQuestions: riskQuestions.length },
              { situation: 'assessment' }
            )
          );
        }
      }
    }

    return signals;
  }
}

/**
 * Detects social conformity - tendency to follow peer preferences.
 */
export class SocialConformityDetector extends BiasDetector {
  getBiasType(): BiasType {
    return 'socialConformity';
  }

  detect(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Check for peer influence in rationale
    for (const choice of input.careerChoices) {
      const rationale = choice.rationale?.toLowerCase() || '';

      if (
        rationale.includes('friend') ||
        rationale.includes('peer') ||
        rationale.includes('classmate') ||
        rationale.includes('everyone') ||
        rationale.includes('popular')
      ) {
        signals.push(
          this.createSignal(
            0.6,
            'careerChoice',
            `Career choice influenced by peer/social factors`,
            { careerId: choice.careerId, rationale: choice.rationale },
            { careerId: choice.careerId, situation: 'career_selection' }
          )
        );
      }
    }

    // Check assessment for conformity patterns
    if (input.assessmentResponses) {
      const conformityIndicators = input.assessmentResponses.filter((r) => {
        const response = String(r.response).toLowerCase();
        return (
          response.includes('others') ||
          response.includes('people') ||
          response.includes('society') ||
          response.includes('what others think')
        );
      });

      if (conformityIndicators.length >= 2) {
        signals.push(
          this.createSignal(
            0.5,
            'assessment',
            `Multiple assessment responses indicate social consideration`,
            { indicatorCount: conformityIndicators.length },
            { situation: 'assessment' }
          )
        );
      }
    }

    return signals;
  }
}

/**
 * Detects status seeking - overweighting prestige.
 */
export class StatusBiasDetector extends BiasDetector {
  getBiasType(): BiasType {
    return 'statusSeeking';
  }

  detect(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Check for prestige indicators in career choices
    const prestigeCareers = ['medicine', 'law', 'investment-banking', 'consulting', 'engineering-premier'];

    for (const choice of input.careerChoices) {
      const rationale = choice.rationale?.toLowerCase() || '';
      const isPrestigeCareer = prestigeCareers.some((pc) =>
        choice.careerId.toLowerCase().includes(pc)
      );

      if (isPrestigeCareer) {
        if (
          rationale.includes('prestige') ||
          rationale.includes('prestigious') ||
          rationale.includes('status') ||
          rationale.includes('respect') ||
          rationale.includes('impressive')
        ) {
          signals.push(
            this.createSignal(
              0.75,
              'careerChoice',
              `Prestige/status cited as reason for ${choice.careerId} preference`,
              { careerId: choice.careerId, rationale: choice.rationale },
              { careerId: choice.careerId, situation: 'career_selection' }
            )
          );
        }
      }

      // Check if prestige outweighs utility
      if (isPrestigeCareer && choice.utility < 60 && choice.rank <= 3) {
        signals.push(
          this.createSignal(
            0.7,
            'careerChoice',
            `High ranking of ${choice.careerId} despite lower utility suggests status bias`,
            { careerId: choice.careerId, utility: choice.utility, rank: choice.rank },
            { careerId: choice.careerId, situation: 'career_ranking' }
          )
        );
      }
    }

    return signals;
  }
}

/**
 * Detects authority influence - following parent/authority expectations.
 */
export class AuthorityInfluenceDetector extends BiasDetector {
  getBiasType(): BiasType {
    return 'authorityInfluence';
  }

  detect(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Check family interactions
    if (input.familyInteractions) {
      const { parentExpectations, studentAlignment, conflictLevel } = input.familyInteractions;

      // High alignment suggests authority influence
      if (studentAlignment > 0.7 && parentExpectations.length > 0) {
        signals.push(
          this.createSignal(
            studentAlignment,
            'familyInteraction',
            `High alignment (${Math.round(studentAlignment * 100)}%) with parent expectations`,
            { alignment: studentAlignment, parentExpectations },
            { situation: 'family_decision' }
          )
        );
      }

      // Low conflict despite high parent pressure suggests compliance
      if (conflictLevel < 0.3 && parentExpectations.some((p) => p.strength > 0.7)) {
        signals.push(
          this.createSignal(
            0.6,
            'familyInteraction',
            `Low conflict despite strong parent expectations suggests authority compliance`,
            { conflictLevel, parentExpectations },
            { situation: 'family_decision' }
          )
        );
      }
    }

    // Check rationale for parent mentions
    for (const choice of input.careerChoices) {
      const rationale = choice.rationale?.toLowerCase() || '';

      if (
        rationale.includes('parent') ||
        rationale.includes('father') ||
        rationale.includes('mother') ||
        rationale.includes('family') ||
        rationale.includes('expect')
      ) {
        signals.push(
          this.createSignal(
            0.7,
            'familyInteraction',
            `Family/parent expectations cited in career choice`,
            { careerId: choice.careerId, rationale: choice.rationale },
            { careerId: choice.careerId, situation: 'career_selection' }
          )
        );
      }
    }

    return signals;
  }
}

/**
 * Detects risk perception bias - gap between actual and perceived risk.
 */
export class RiskPerceptionEngine {
  private config: ProspectTheoryConfig;

  constructor(config: ProspectTheoryConfig) {
    this.config = config;
  }

  analyzeRiskPerception(
    careerId: string,
    actualRisk: number,
    perceivedRisk: number
  ): RiskPerception {
    const perceptionGap = perceivedRisk - actualRisk;
    const biasDirection: RiskPerception['biasDirection'] =
      Math.abs(perceptionGap) < 10
        ? 'accurate'
        : perceptionGap > 0
        ? 'overestimated'
        : 'underestimated';

    const factors: string[] = [];

    if (biasDirection === 'overestimated') {
      factors.push('Risk may be exaggerated by limited information');
      factors.push('Loss aversion may inflate risk perception');
    } else if (biasDirection === 'underestimated') {
      factors.push('Optimism bias may reduce risk awareness');
      factors.push('Limited exposure to failure outcomes');
    } else {
      factors.push('Risk perception appears well-calibrated');
    }

    return {
      careerId,
      actualRisk,
      perceivedRisk,
      perceptionGap: Math.abs(perceptionGap),
      biasDirection,
      factors,
    };
  }

  detectSignals(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Check for extreme risk assessments
    if (input.assessmentResponses) {
      const riskResponses = input.assessmentResponses.filter(
        (r) => r.category === 'risk_perception'
      );

      for (const response of riskResponses) {
        const riskValue = Number(response.response);
        if (!isNaN(riskValue)) {
          if (riskValue > 80) {
            signals.push({
              id: `risk-perception-${Date.now()}`,
              biasType: 'riskPerceptionBias',
              source: 'assessment',
              strength: riskValue / 100,
              timestamp: Date.now(),
              evidence: {
                description: `Extremely high risk assessment (${riskValue}%)`,
                data: { questionId: response.questionId, riskValue },
              },
              context: { situation: 'risk_assessment' },
            });
          } else if (riskValue < 20) {
            signals.push({
              id: `risk-perception-${Date.now()}`,
              biasType: 'riskPerceptionBias',
              source: 'assessment',
              strength: (100 - riskValue) / 100,
              timestamp: Date.now(),
              evidence: {
                description: `Extremely low risk assessment (${riskValue}%)`,
                data: { questionId: response.questionId, riskValue },
              },
              context: { situation: 'risk_assessment' },
            });
          }
        }
      }
    }

    return signals;
  }
}

/**
 * Detects optimism bias - overestimating positive outcomes.
 */
export class OptimismBiasDetector extends BiasDetector {
  getBiasType(): BiasType {
    return 'optimismBias';
  }

  detect(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Check for overly optimistic career outcome expectations
    for (const choice of input.careerChoices) {
      const rationale = choice.rationale?.toLowerCase() || '';

      if (
        rationale.includes('guaranteed') ||
        rationale.includes('sure') ||
        rationale.includes('definitely') ||
        rationale.includes('easy') ||
        rationale.includes('quick')
      ) {
        signals.push(
          this.createSignal(
            0.6,
            'careerChoice',
            `Overly optimistic language in career rationale`,
            { careerId: choice.careerId, rationale: choice.rationale },
            { careerId: choice.careerId, situation: 'career_selection' }
          )
        );
      }
    }

    // Check assessment for unrealistic expectations
    if (input.assessmentResponses) {
      const outcomeQuestions = input.assessmentResponses.filter(
        (r) => r.category === 'outcome_expectations'
      );

      const optimisticCount = outcomeQuestions.filter((r) => {
        const response = String(r.response).toLowerCase();
        return (
          response.includes('very likely') ||
          response.includes('definitely') ||
          response.includes('certain') ||
          response.includes('guaranteed')
        );
      }).length;

      if (outcomeQuestions.length > 0) {
        const ratio = optimisticCount / outcomeQuestions.length;
        if (ratio > 0.7) {
          signals.push(
            this.createSignal(
              ratio,
              'assessment',
              `${Math.round(ratio * 100)}% of outcome expectations are highly optimistic`,
              { optimisticCount, totalQuestions: outcomeQuestions.length },
              { situation: 'assessment' }
            )
          );
        }
      }
    }

    return signals;
  }
}

/**
 * Detects sunk cost sensitivity - continuing due to past investment.
 */
export class SunkCostDetector extends BiasDetector {
  getBiasType(): BiasType {
    return 'sunkCostSensitivity';
  }

  detect(input: BiasDetectionInput): BiasSignal[] {
    const signals: BiasSignal[] = [];

    // Check decision history for sunk cost patterns
    if (input.decisionHistory) {
      for (const decision of input.decisionHistory) {
        // Check if choice aligns with previous sunk investment
        const hasSunkCostLanguage =
          decision.choice.toLowerCase().includes('already') ||
          decision.choice.toLowerCase().includes('invested') ||
          decision.choice.toLowerCase().includes('spent') ||
          decision.choice.toLowerCase().includes('time');

        if (hasSunkCostLanguage) {
          signals.push(
            this.createSignal(
              0.6,
              'decisionHistory',
              `Decision appears influenced by sunk costs`,
              { decisionId: decision.decisionId, choice: decision.choice },
              { decisionId: decision.decisionId, situation: 'decision_making' }
            )
          );
        }
      }
    }

    // Check rationale for sunk cost mentions
    for (const choice of input.careerChoices) {
      const rationale = choice.rationale?.toLowerCase() || '';

      if (
        rationale.includes('already') ||
        rationale.includes('invested') ||
        rationale.includes('years') ||
        rationale.includes('prepared') ||
        rationale.includes('sunk')
      ) {
        signals.push(
          this.createSignal(
            0.65,
            'careerChoice',
            `Sunk cost considerations in career rationale`,
            { careerId: choice.careerId, rationale: choice.rationale },
            { careerId: choice.careerId, situation: 'career_selection' }
          )
        );
      }
    }

    return signals;
  }
}

/**
 * Factory functions for creating detectors.
 */
export function createLossAversionDetector(config: ProspectTheoryConfig): LossAversionDetector {
  return new LossAversionDetector(config);
}

export function createSocialConformityDetector(config: ProspectTheoryConfig): SocialConformityDetector {
  return new SocialConformityDetector(config);
}

export function createStatusBiasDetector(config: ProspectTheoryConfig): StatusBiasDetector {
  return new StatusBiasDetector(config);
}

export function createAuthorityInfluenceDetector(config: ProspectTheoryConfig): AuthorityInfluenceDetector {
  return new AuthorityInfluenceDetector(config);
}

export function createRiskPerceptionEngine(config: ProspectTheoryConfig): RiskPerceptionEngine {
  return new RiskPerceptionEngine(config);
}

export function createOptimismBiasDetector(config: ProspectTheoryConfig): OptimismBiasDetector {
  return new OptimismBiasDetector(config);
}

export function createSunkCostDetector(config: ProspectTheoryConfig): SunkCostDetector {
  return new SunkCostDetector(config);
}
