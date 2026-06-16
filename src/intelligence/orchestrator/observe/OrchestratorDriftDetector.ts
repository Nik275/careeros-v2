/**
 * @fileoverview Drift detection for observe-mode orchestration.
 */

import type {
  ObserveModeComparison,
  ObserveModeDrift,
  ObservedOrchestratorCall,
  ObservedProductionCall,
} from './ObserveModeTypes';
import type { AuthorityExecutionBindingResult } from '../bindings/AuthorityExecutionBindingTypes';

export class OrchestratorDriftDetector {
  compare(input: {
    productionCall: ObservedProductionCall;
    orchestratorCall?: ObservedOrchestratorCall;
    compareOutputs: boolean;
  }): ObserveModeComparison {
    const drifts: ObserveModeDrift[] = [];
    const notes: string[] = [];
    const productionOutputCaptured = input.productionCall.outputSnapshot !== undefined;
    const orchestratorOutputCaptured = input.orchestratorCall?.outputSnapshot !== undefined;

    if (!input.orchestratorCall) {
      return {
        status: 'FAILED',
        comparable: false,
        productionOutputCaptured,
        orchestratorOutputCaptured: false,
        drifts: [
          createDrift('ROUTING_FAILURE', 'high', [
            'No orchestrator call was produced for the observed production flow.',
          ]),
        ],
        notes: ['Observe-mode routing did not produce an orchestrator call.'],
      };
    }

    if (input.orchestratorCall.status === 'FAILED') {
      return {
        status: 'FAILED',
        comparable: false,
        productionOutputCaptured,
        orchestratorOutputCaptured,
        drifts: [
          createDrift('ROUTING_FAILURE', 'high', [
            input.orchestratorCall.errorMessage ?? 'Orchestrator failed without a message.',
          ]),
        ],
        notes: ['Orchestrator observe call failed; production output remains authoritative.'],
      };
    }

    if (input.orchestratorCall.bindingResult) {
      const bindingComparison = this.compareBindingResult({
        productionCall: input.productionCall,
        bindingResult: input.orchestratorCall.bindingResult,
        compareOutputs: input.compareOutputs,
      });
      if (bindingComparison) {
        return bindingComparison;
      }
    }

    const response = input.orchestratorCall.response;
    if (!response && (!productionOutputCaptured || !orchestratorOutputCaptured)) {
      return notComparable({
        productionOutputCaptured,
        orchestratorOutputCaptured,
        notes: [
          'No orchestrator response was available for comparison.',
          'Skeleton orchestrator runs often produce audit-only results and are not comparable.',
        ],
      });
    }

    if (response && (response.status === 'rejected' || response.status === 'failed')) {
      drifts.push(
        createDrift('LIFECYCLE_FAILURE', 'high', [
          `Orchestrator response status was ${response.status}.`,
        ])
      );
    }

    if (
      response &&
      !response.authorityIntegrationStatus.registeredAuthorities.includes(
        response.plan.requiredAuthorities[0]
      )
    ) {
      drifts.push(
        createDrift('MISSING_AUTHORITY', 'high', [
          'At least one required authority was not registered in the orchestrator response.',
        ])
      );
    }

    if (response) {
      const missingCapabilities = response.plan.requiredCapabilities.filter(
        (capability) => !input.productionCall.capability || capability !== input.productionCall.capability
      );
      if (
        input.productionCall.requestType !== 'FULL_LIFECYCLE' &&
        missingCapabilities.length > 0
      ) {
        drifts.push(
          createDrift('MISSING_CAPABILITY', 'medium', [
            `Production capability ${input.productionCall.capability} did not match orchestrator capabilities ${response.plan.requiredCapabilities.join(', ')}.`,
          ])
        );
      }
    }

    if (!input.compareOutputs) {
      return notComparable({
        productionOutputCaptured,
        orchestratorOutputCaptured,
        drifts,
        notes: ['Output comparison disabled by observe-mode configuration.'],
      });
    }

    if (!productionOutputCaptured || !orchestratorOutputCaptured) {
      return notComparable({
        productionOutputCaptured,
        orchestratorOutputCaptured,
        drifts,
        notes: [
          'Output comparison requires both production and orchestrator output snapshots.',
          'Skeleton orchestrator runs often produce audit-only results and are not comparable.',
        ],
      });
    }

    if (!deepEqual(input.productionCall.outputSnapshot, input.orchestratorCall.outputSnapshot)) {
      drifts.push(
        createDrift('OUTPUT_MISMATCH', 'high', [
          'Production and orchestrator output snapshots were not equal.',
        ])
      );
    }

    if (drifts.length > 0) {
      return {
        status: 'DRIFT_DETECTED',
        comparable: true,
        productionOutputCaptured,
        orchestratorOutputCaptured,
        drifts,
        notes,
      };
    }

    return {
      status: 'MATCHED',
      comparable: true,
      productionOutputCaptured,
      orchestratorOutputCaptured,
      drifts,
      notes: ['Production and orchestrator snapshots matched.'],
    };
  }

  private compareBindingResult(input: {
    productionCall: ObservedProductionCall;
    bindingResult: AuthorityExecutionBindingResult;
    compareOutputs: boolean;
  }): ObserveModeComparison | undefined {
    const productionOutputCaptured = input.productionCall.outputSnapshot !== undefined;
    const bindingOutputCaptured = input.bindingResult.outputSnapshot !== undefined;

    switch (input.bindingResult.comparisonStatus) {
      case 'SELF_MIRRORED':
        return notComparable({
          status: 'SELF_MIRRORED',
          productionOutputCaptured,
          orchestratorOutputCaptured: bindingOutputCaptured,
          drifts: [
            createDrift('SELF_MIRRORED', 'low', [
              'Dry-run binding returned supplied production output and cannot prove independent parity.',
            ]),
          ],
          notes: ['SELF_MIRRORED is not counted as MATCHED.'],
        });
      case 'BINDING_DISABLED':
        return notComparable({
          status: 'BINDING_DISABLED',
          productionOutputCaptured,
          orchestratorOutputCaptured: bindingOutputCaptured,
          drifts: [
            createDrift('BINDING_DISABLED', 'low', ['Dry-run binding was disabled by configuration.']),
          ],
          notes: ['Dry-run binding did not execute.'],
        });
      case 'BINDING_NOT_FOUND':
        return notComparable({
          status: 'BINDING_NOT_FOUND',
          productionOutputCaptured,
          orchestratorOutputCaptured: bindingOutputCaptured,
          drifts: [
            createDrift('BINDING_NOT_FOUND', 'medium', ['No dry-run binding was registered for this flow.']),
          ],
          notes: ['No binding was available for comparison.'],
        });
      case 'BINDING_FAILED':
      case 'FAILED':
        return {
          status: 'BINDING_FAILED',
          comparable: false,
          productionOutputCaptured,
          orchestratorOutputCaptured: bindingOutputCaptured,
          drifts: [
            createDrift('BINDING_FAILED', 'high', [
              input.bindingResult.failure?.message ?? 'Dry-run binding failed.',
            ]),
          ],
          notes: ['Dry-run binding failed; production output remains authoritative.'],
        };
      case 'NOT_COMPARABLE':
        return notComparable({
          status: 'NOT_COMPARABLE',
          productionOutputCaptured,
          orchestratorOutputCaptured: bindingOutputCaptured,
          notes: input.bindingResult.notes,
        });
      case 'INDEPENDENT_COMPARISON':
        break;
      default:
        return undefined;
    }

    if (!input.bindingResult.independent || !input.bindingResult.comparable) {
      return notComparable({
        status: 'NOT_COMPARABLE',
        productionOutputCaptured,
        orchestratorOutputCaptured: bindingOutputCaptured,
        notes: ['Binding result was not independent and comparable.'],
      });
    }

    if (!input.compareOutputs) {
      return notComparable({
        status: 'NOT_COMPARABLE',
        productionOutputCaptured,
        orchestratorOutputCaptured: bindingOutputCaptured,
        notes: ['Output comparison disabled by observe-mode configuration.'],
      });
    }

    if (!productionOutputCaptured || !bindingOutputCaptured) {
      return notComparable({
        status: 'NOT_COMPARABLE',
        productionOutputCaptured,
        orchestratorOutputCaptured: bindingOutputCaptured,
        notes: ['Independent binding comparison requires production and binding output snapshots.'],
      });
    }

    if (!deepEqual(input.productionCall.outputSnapshot, input.bindingResult.outputSnapshot)) {
      return {
        status: 'DRIFT_DETECTED',
        comparable: true,
        productionOutputCaptured,
        orchestratorOutputCaptured: bindingOutputCaptured,
        drifts: [
          createDrift('OUTPUT_MISMATCH', 'high', [
            'Production and independent binding output snapshots were not equal.',
          ]),
        ],
        notes: ['Independent binding comparison detected output drift.'],
      };
    }

    return {
      status: 'MATCHED',
      comparable: true,
      productionOutputCaptured,
      orchestratorOutputCaptured: bindingOutputCaptured,
      drifts: [],
      notes: ['Independent binding output matched production output.'],
    };
  }
}

function notComparable(input: {
  status?: ObserveModeComparison['status'];
  productionOutputCaptured: boolean;
  orchestratorOutputCaptured: boolean;
  drifts?: readonly ObserveModeDrift[];
  notes: readonly string[];
}): ObserveModeComparison {
  return {
    status: input.status ?? (input.drifts && input.drifts.length > 0 ? 'DRIFT_DETECTED' : 'NOT_COMPARABLE'),
    comparable: false,
    productionOutputCaptured: input.productionOutputCaptured,
    orchestratorOutputCaptured: input.orchestratorOutputCaptured,
    drifts: input.drifts ?? [],
    notes: input.notes,
  };
}

function createDrift(
  driftType: ObserveModeDrift['driftType'],
  severity: ObserveModeDrift['severity'],
  evidence: readonly string[]
): ObserveModeDrift {
  return {
    driftId: `observe-drift-${hashString(`${driftType}|${evidence.join('|')}`)}`,
    driftType,
    status: 'DRIFT_DETECTED',
    severity,
    description: `${driftType} observed during observe-mode comparison.`,
    evidence,
  };
}

function deepEqual(left: unknown, right: unknown): boolean {
  return stableStringify(left) === stableStringify(right);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortValue(entry)])
    );
  }
  return value;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
