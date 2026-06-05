/**
 * CareerOS Assessment Signal Engine - Signal Extractor
 *
 * Phase B.1: Assessment Processing Layer
 *
 * Converts assessment responses into normalized signals for dimension scoring.
 *
 * @module signal-extractor
 * @version 1.0.0
 */

import type {
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentSignal,
  LikertQuestion,
  MultipleChoiceQuestion,
  RankingQuestion,
  ForcedChoiceQuestion,
  ScaleQuestion,
} from './assessment-types';

/**
 * Extracts signals from assessment responses.
 *
 * The SignalExtractor converts raw question responses into normalized
 * assessment signals with dimension mapping, strength scores, and
 * confidence values.
 */
export class SignalExtractor {
  /**
   * Extract signals from a batch of responses.
   *
   * @param questions - Array of questions that were asked
   * @param responses - Array of user responses
   * @returns Array of extracted signals
   */
  extractSignals(
    questions: AssessmentQuestion[],
    responses: AssessmentResponse[]
  ): AssessmentSignal[] {
    const signals: AssessmentSignal[] = [];

    for (const response of responses) {
      const question = questions.find((q) => q.id === response.questionId);
      if (!question) continue;

      const signal = this.extractSignal(question, response);
      if (signal) {
        signals.push(signal);
      }
    }

    return signals;
  }

  /**
   * Extract a single signal from a question-response pair.
   *
   * @param question - The question that was asked
   * @param response - The user's response
   * @returns Extracted signal or null if extraction fails
   */
  extractSignal(
    question: AssessmentQuestion,
    response: AssessmentResponse
  ): AssessmentSignal | null {
    switch (question.type) {
      case 'likert':
        return this.extractLikertSignal(question, response);
      case 'multipleChoice':
        return this.extractMultipleChoiceSignal(question, response);
      case 'ranking':
        return this.extractRankingSignal(question, response);
      case 'forcedChoice':
        return this.extractForcedChoiceSignal(question, response);
      case 'scale':
        return this.extractScaleSignal(question, response);
      default:
        return null;
    }
  }

  /**
   * Extract signal from Likert response.
   */
  private extractLikertSignal(
    question: LikertQuestion,
    response: AssessmentResponse
  ): AssessmentSignal | null {
    if (response.type !== 'likert') return null;

    const range = question.maxScale - question.minScale;
    const normalizedValue = ((response.value - question.minScale) / range) * 100;

    return {
      questionId: question.id,
      dimension: question.dimension,
      strength: Math.round(normalizedValue),
      confidence: 90,
      category: question.category,
      weight: question.weight,
    };
  }

  /**
   * Extract signal from Multiple Choice response.
   */
  private extractMultipleChoiceSignal(
    question: MultipleChoiceQuestion,
    response: AssessmentResponse
  ): AssessmentSignal | null {
    if (response.type !== 'multipleChoice') return null;

    const selectedOptions = question.options.filter((opt) =>
      response.selectedOptionIds.includes(opt.id)
    );

    if (selectedOptions.length === 0) return null;

    const avgScore =
      selectedOptions.reduce((sum, opt) => sum + opt.score, 0) /
      selectedOptions.length;

    const confidence = question.allowMultiple
      ? Math.max(60, 90 - selectedOptions.length * 10)
      : 95;

    return {
      questionId: question.id,
      dimension: question.dimension,
      strength: Math.round(avgScore),
      confidence,
      category: question.category,
      weight: question.weight,
    };
  }

  /**
   * Extract signal from Ranking response.
   */
  private extractRankingSignal(
    question: RankingQuestion,
    response: AssessmentResponse
  ): AssessmentSignal | null {
    if (response.type !== 'ranking') return null;

    const totalItems = question.items.length;
    const itemCount = response.rankedItemIds.length;

    if (itemCount === 0) return null;

    const topItemId = response.rankedItemIds[0];
    const topItem = question.items.find((item) => item.id === topItemId);

    if (!topItem) return null;

    const completeness = (itemCount / totalItems) * 100;
    const confidence = Math.round(70 + completeness * 0.3);

    return {
      questionId: question.id,
      dimension: question.dimension,
      strength: 100,
      confidence,
      category: question.category,
      weight: question.weight,
    };
  }

  /**
   * Extract signal from Forced Choice response.
   */
  private extractForcedChoiceSignal(
    question: ForcedChoiceQuestion,
    response: AssessmentResponse
  ): AssessmentSignal | null {
    if (response.type !== 'forcedChoice') return null;

    const isOptionA = response.selectedOptionId === question.optionA.id;
    const selectedDimension = isOptionA ? question.optionA.dimension : question.optionB.dimension;

    return {
      questionId: question.id,
      dimension: selectedDimension,
      strength: 100,
      confidence: 85,
      category: question.category,
      weight: question.weight,
    };
  }

  /**
   * Extract signal from Scale response.
   */
  private extractScaleSignal(
    question: ScaleQuestion,
    response: AssessmentResponse
  ): AssessmentSignal | null {
    if (response.type !== 'scale') return null;

    const range = question.max - question.min;
    const normalizedValue = ((response.value - question.min) / range) * 100;

    return {
      questionId: question.id,
      dimension: question.dimension,
      strength: Math.round(normalizedValue),
      confidence: 85,
      category: question.category,
      weight: question.weight,
    };
  }
}

/**
 * Factory function for SignalExtractor.
 */
export function createSignalExtractor(): SignalExtractor {
  return new SignalExtractor();
}
