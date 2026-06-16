/**
 * @fileoverview Facade-owned adapter for independent career-fit dry-run execution.
 */

export interface CareerFitDryRunInput {
  execute: () => unknown;
}

export class CareerFitDryRunAdapter {
  calculateFit(input: CareerFitDryRunInput): unknown {
    return input.execute();
  }
}
