/**
 * @fileoverview Response validation for Phase 6.1 HTTP route-shadow execution.
 */

import type {
  RouteShadowHttpResponse,
  RouteShadowHttpResponseValidation,
  RouteShadowHttpVerdict,
} from './RouteShadowHttpTypes';

export function validateRouteShadowHttpResponse(response: RouteShadowHttpResponse): RouteShadowHttpResponseValidation {
  const reasons: string[] = [];
  const body = isRecord(response.body) ? response.body : {};
  const serialized = safeStringify(response.body);
  const jsonSafe = response.jsonSafe && canRoundTripJson(response.body);
  const responseShapeValid =
    typeof body.status === 'string' &&
    typeof body.verdict === 'string' &&
    typeof body.flow === 'string' &&
    typeof body.hookReached === 'boolean' &&
    typeof body.matched === 'boolean' &&
    typeof body.driftDetected === 'boolean' &&
    typeof body.failure === 'boolean' &&
    typeof body.rollback === 'boolean' &&
    isRecord(body.auditSummary) &&
    body.productionOutputPreserved === true &&
    body.liveRoutingEnabled === false;
  const httpStatusValid = [200, 400, 403, 500].includes(response.httpStatus);
  const rawPayloadLeakDetected =
    /"(rawStudentData|realStudentData)"\s*:\s*true/i.test(serialized) ||
    /"(studentEmail|studentPhone|studentAddress|ssn)"\s*:/i.test(serialized) ||
    /blocked@example\.com/i.test(serialized);
  const stackTraceLeakDetected = /(^|\n)\s*at\s+\S+|stack(trace)?|Error:\s.+/i.test(serialized);
  const internalErrorLeakDetected = /node_modules|webpack-internal|RouteShadowExecutionService\.ts|\.next[\\/]/i.test(serialized);
  const productionMutationDetected =
    body.productionMutated === true ||
    body.productionMutation === true ||
    body.productionOutputReplaced === true ||
    /"production(Output)?(Mutated|Replaced)"\s*:\s*true/i.test(serialized);

  if (!httpStatusValid) reasons.push('HTTP status is not an allowed route-shadow status.');
  if (!jsonSafe) reasons.push('Response is not JSON-safe.');
  if (!responseShapeValid) reasons.push('Response shape is missing required route-shadow fields.');
  if (body.liveRoutingEnabled !== false) reasons.push('liveRoutingEnabled must remain false.');
  if (body.productionOutputPreserved !== true) reasons.push('productionOutputPreserved must remain true.');
  if (rawPayloadLeakDetected) reasons.push('Response leaks raw or real student payload markers.');
  if (stackTraceLeakDetected) reasons.push('Response leaks a stack trace.');
  if (internalErrorLeakDetected) reasons.push('Response leaks internal implementation details.');
  if (productionMutationDetected) reasons.push('Response indicates production mutation or output replacement.');

  const valid = reasons.length === 0;
  return Object.freeze({
    valid,
    verdict: validationVerdict(valid, body),
    httpStatusValid,
    jsonSafe,
    responseShapeValid,
    liveRoutingDisabled: body.liveRoutingEnabled === false,
    productionOutputPreserved: body.productionOutputPreserved === true,
    hookReached: body.hookReached === true,
    matched: body.matched === true,
    driftDetected: body.driftDetected === true,
    failure: body.failure === true,
    rollback: body.rollback === true,
    rawPayloadLeakDetected,
    stackTraceLeakDetected,
    internalErrorLeakDetected,
    productionMutationDetected,
    reasons: reasons.length > 0 ? reasons : ['Route-shadow HTTP response is JSON-safe and production-safe.'],
  });
}

function validationVerdict(valid: boolean, body: Record<string, unknown>): RouteShadowHttpVerdict {
  if (!valid) return 'FAIL';
  if (body.verdict === 'BLOCKED') return 'BLOCKED';
  if (body.verdict === 'FAIL') return 'FAIL';
  if (body.verdict === 'PASS_WITH_WARNINGS') return 'PASS_WITH_WARNINGS';
  return 'PASS';
}

function canRoundTripJson(value: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '[unserializable]';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
