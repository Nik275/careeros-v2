/**
 * @fileoverview Guards observe hooks from recursive dry-run execution.
 */

export interface ObserveExecutionGuardSnapshot {
  activeDepth: number;
  skippedRecursiveObserveCount: number;
  lastSkipReason?: string;
}

let activeDepth = 0;
let skippedRecursiveObserveCount = 0;
let lastSkipReason: string | undefined;

export class ObserveExecutionGuard {
  static isInObserveExecution(): boolean {
    return activeDepth > 0;
  }

  static shouldSkipObserve(reason: string = 'observe execution already active'): boolean {
    if (!ObserveExecutionGuard.isInObserveExecution()) {
      return false;
    }

    skippedRecursiveObserveCount += 1;
    lastSkipReason = reason;
    return true;
  }

  static runWithoutObserve<TResult>(operation: () => TResult): TResult {
    activeDepth += 1;
    try {
      return operation();
    } finally {
      activeDepth = Math.max(0, activeDepth - 1);
    }
  }

  static async runWithoutObserveAsync<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    activeDepth += 1;
    try {
      return await operation();
    } finally {
      activeDepth = Math.max(0, activeDepth - 1);
    }
  }

  static getSnapshot(): ObserveExecutionGuardSnapshot {
    return {
      activeDepth,
      skippedRecursiveObserveCount,
      lastSkipReason,
    };
  }

  static resetForTests(): void {
    activeDepth = 0;
    skippedRecursiveObserveCount = 0;
    lastSkipReason = undefined;
  }
}
