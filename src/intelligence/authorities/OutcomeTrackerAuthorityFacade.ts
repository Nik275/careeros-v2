/**
 * @fileoverview OutcomeTrackerAuthority Phase 4.1 facade.
 *
 * Wraps existing LEARN systems without changing outcome tracking, feedback,
 * calibration, quality, or longitudinal learning behavior.
 */

import {
  AuthorityFacadeBase,
  type AuthorityExecutionOptions,
  type AuthorityFacadeBaseOptions,
  type AuthorityOperation,
} from './AuthorityFacadeBase';

export class OutcomeTrackerAuthorityFacade extends AuthorityFacadeBase {
  constructor(options: AuthorityFacadeBaseOptions = {}) {
    super(
      {
        authority: 'OutcomeTrackerAuthority',
        capability: 'LEARN',
        facadeName: 'OutcomeTrackerAuthorityFacade',
        facadeModulePath: 'src/intelligence/authorities/OutcomeTrackerAuthorityFacade.ts',
        version: '4.1.0',
        description:
          'Wrap-only facade for outcome tracking, feedback, calibration, and learning-loop systems.',
        ownedSystemExamples: [
          'outcome tracking',
          'feedback loops',
          'success monitoring',
          'longitudinal learning',
        ],
      },
      options
    );
  }

  learn<TResult>(
    operationName: string,
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  learn<TResult>(
    operationName: string,
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  learn<TResult>(
    operationName: string,
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.runWrappedOperation(operationName, operation, {
      ...options,
      capability: options.capability ?? 'LEARN',
    });
  }

  trackOutcome<TResult>(
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  trackOutcome<TResult>(
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  trackOutcome<TResult>(
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.learn('trackOutcome', operation, options);
  }

  processFeedback<TResult>(
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  processFeedback<TResult>(
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  processFeedback<TResult>(
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.learn('processFeedback', operation, options);
  }

  generateLearningSignals<TResult>(
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  generateLearningSignals<TResult>(
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  generateLearningSignals<TResult>(
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.learn('generateLearningSignals', operation, options);
  }
}
