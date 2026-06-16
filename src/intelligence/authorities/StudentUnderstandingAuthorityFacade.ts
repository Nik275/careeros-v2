/**
 * @fileoverview StudentUnderstandingAuthority Phase 4.1 facade.
 *
 * Wraps existing UNDERSTAND systems without changing assessment, archetype,
 * profile, or student-model behavior.
 */

import {
  AuthorityFacadeBase,
  type AuthorityExecutionOptions,
  type AuthorityFacadeBaseOptions,
  type AuthorityOperation,
} from './AuthorityFacadeBase';

export class StudentUnderstandingAuthorityFacade extends AuthorityFacadeBase {
  constructor(options: AuthorityFacadeBaseOptions = {}) {
    super(
      {
        authority: 'StudentUnderstandingAuthority',
        capability: 'UNDERSTAND',
        facadeName: 'StudentUnderstandingAuthorityFacade',
        facadeModulePath:
          'src/intelligence/authorities/StudentUnderstandingAuthorityFacade.ts',
        version: '4.1.0',
        description:
          'Wrap-only facade for assessment, archetype, profile, and student understanding systems.',
        ownedSystemExamples: [
          'assessment',
          'archetype',
          'profile',
          'student understanding',
          'psychological modeling',
        ],
      },
      options
    );
  }

  understand<TResult>(
    operationName: string,
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  understand<TResult>(
    operationName: string,
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  understand<TResult>(
    operationName: string,
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.runWrappedOperation(operationName, operation, {
      ...options,
      capability: options.capability ?? 'UNDERSTAND',
    });
  }

  processAssessment<TResult>(
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  processAssessment<TResult>(
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  processAssessment<TResult>(
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.understand('processAssessment', operation, options);
  }

  interpretProfile<TResult>(
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  interpretProfile<TResult>(
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  interpretProfile<TResult>(
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.understand('interpretProfile', operation, options);
  }

  inferArchetype<TResult>(
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  inferArchetype<TResult>(
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  inferArchetype<TResult>(
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.understand('inferArchetype', operation, options);
  }
}
