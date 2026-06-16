/**
 * @fileoverview Shared fire-and-forget executor for observe-mode hooks.
 *
 * The executor has no business logic. It only checks configuration, invokes the
 * observe router, tracks pending work for tests, and ensures observe failures
 * never throw into production callers.
 */

import type { ObserveModeConfig } from './ObserveModeConfig';
import type { ObserveModeRouter } from './ObserveModeRouter';
import type { ObserveModeRequest } from './ObserveModeTypes';
import type { ObserveTelemetryService } from './ObserveTelemetryService';

export interface ObserveHookExecutorOptions {
  config: ObserveModeConfig;
  router: Pick<ObserveModeRouter, 'observe'>;
  telemetryService?: Pick<ObserveTelemetryService, 'recordHookFailure'>;
  onError?: (error: unknown) => void;
}

export class ObserveHookExecutor {
  private readonly config: ObserveModeConfig;
  private readonly router: Pick<ObserveModeRouter, 'observe'>;
  private readonly telemetryService?: Pick<ObserveTelemetryService, 'recordHookFailure'>;
  private readonly onError?: (error: unknown) => void;
  private readonly pending = new Set<Promise<unknown>>();

  constructor(options: ObserveHookExecutorOptions) {
    this.config = options.config;
    this.router = options.router;
    this.telemetryService = options.telemetryService;
    this.onError = options.onError;
  }

  run(createRequest: () => ObserveModeRequest): void {
    if (!this.config.enabled) {
      return;
    }

    try {
      const request = createRequest();
      const pending = Promise.resolve(this.router.observe(request))
        .catch((error: unknown) => {
          this.recordError(error, request);
        })
        .finally(() => {
          this.pending.delete(pending);
        });

      this.pending.add(pending);
    } catch (error) {
      this.recordError(error);
    }
  }

  async waitForIdle(): Promise<void> {
    await Promise.all(Array.from(this.pending));
  }

  private recordError(error: unknown, request?: ObserveModeRequest): void {
    this.onError?.(error);
    this.telemetryService?.recordHookFailure({
      hookName: readHookName(request) ?? 'ObserveHookExecutor',
      error,
      traceId: request?.traceId,
      requestId: request?.observeRequestId,
      flowType: request?.productionCall.flowName,
      authority: readMetadataString(request?.productionCall.metadata, 'authority'),
      capability: request?.productionCall.capability,
    });
  }
}

function readHookName(request?: ObserveModeRequest): string | undefined {
  return readMetadataString(request?.productionCall.metadata, 'hook');
}

function readMetadataString(
  metadata: Readonly<Record<string, unknown>> | undefined,
  key: string
): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : undefined;
}
