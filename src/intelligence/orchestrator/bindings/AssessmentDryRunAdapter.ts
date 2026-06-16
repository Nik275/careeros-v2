/**
 * @fileoverview Adapter for independent assessment dry-run execution.
 *
 * The adapter executes a transient operation supplied by the production
 * assessment boundary. It does not import AssessmentEngine and does not store
 * raw assessment payloads.
 */

export interface AssessmentDryRunInput {
  execute: () => unknown;
}

export class AssessmentDryRunAdapter {
  processResponses(input: AssessmentDryRunInput): unknown {
    return input.execute();
  }
}
