import type { AffordabilityProfile, IndiaStudentProfile } from './types';

export type IndiaLoanTolerance =
  IndiaStudentProfile['financialConstraints']['loanTolerance'];

export type IndiaLoanWillingness = AffordabilityProfile['loanWillingness'];

function assertNever(value: never): never {
  throw new Error(`Unhandled India loan tolerance value: ${String(value)}`);
}

export function normalizeLoanToleranceToWillingness(
  loanTolerance: IndiaLoanTolerance
): IndiaLoanWillingness {
  switch (loanTolerance) {
    case 'NONE':
      return 'NONE';
    case 'LOW':
      return 'LOW';
    case 'MEDIUM':
      return 'MODERATE';
    case 'HIGH':
      return 'HIGH';
    default:
      return assertNever(loanTolerance);
  }
}
