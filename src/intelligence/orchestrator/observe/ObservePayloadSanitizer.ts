/**
 * @fileoverview Privacy-safe payload summarization for observe-mode telemetry.
 */

import type { ObserveModeConfig } from './ObserveModeConfig';
import type {
  ObservePayloadSummary,
  ObservePrivacyClassification,
} from './ObserveTelemetryTypes';

export interface ObservePayloadSanitizerOptions {
  maxPayloadBytes: number;
  captureRawPayloads: boolean;
  hashStudentIdentifiers: boolean;
  privacyMode: ObserveModeConfig['privacyMode'];
}

export interface SanitizePayloadOptions {
  privacyClassification?: ObservePrivacyClassification;
  allowRawPayload?: boolean;
}

const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[-_]?key/i,
  /email/i,
  /phone/i,
  /address/i,
  /ssn/i,
  /birth/i,
  /response/i,
  /raw/i,
  /prompt/i,
  /transcript/i,
];

const IDENTIFIER_FIELD_PATTERNS = [
  /^studentId$/i,
  /^userId$/i,
  /^profileId$/i,
  /^personId$/i,
  /^accountId$/i,
];

export class ObservePayloadSanitizer {
  private readonly options: ObservePayloadSanitizerOptions;

  constructor(options: Partial<ObservePayloadSanitizerOptions> = {}) {
    this.options = {
      maxPayloadBytes: options.maxPayloadBytes ?? 16_384,
      captureRawPayloads: options.captureRawPayloads ?? false,
      hashStudentIdentifiers: options.hashStudentIdentifiers ?? true,
      privacyMode: options.privacyMode ?? 'strict',
    };
  }

  sanitize(payload: unknown, options: SanitizePayloadOptions = {}): ObservePayloadSummary {
    const privacyClassification =
      options.privacyClassification ?? classifyPayload(payload, this.options.privacyMode);
    const redactedFields: string[] = [];
    const hashedFields: string[] = [];
    const estimatedSizeBytes = estimatePayloadSize(payload);
    const allowRawPayload = options.allowRawPayload === true && this.options.captureRawPayloads;
    const sanitized = this.sanitizeValue(payload, {
      path: '',
      allowRawPayload,
      redactedFields,
      hashedFields,
      depth: 0,
    });
    const limited = enforcePayloadLimit(sanitized, this.options.maxPayloadBytes);

    return Object.freeze({
      privacyClassification,
      rawPayloadStored: allowRawPayload,
      estimatedSizeBytes,
      storedSizeBytes: estimatePayloadSize(limited.value),
      truncated: limited.truncated,
      omitted: limited.omitted,
      redactedFields,
      hashedFields,
      fieldCount: isRecord(payload) ? Object.keys(payload).length : undefined,
      arrayLength: Array.isArray(payload) ? payload.length : undefined,
      summary: limited.value,
    });
  }

  hashIdentifier(value: string): string {
    return `hash_${hashString(value)}`;
  }

  private sanitizeValue(
    value: unknown,
    context: {
      path: string;
      allowRawPayload: boolean;
      redactedFields: string[];
      hashedFields: string[];
      depth: number;
    }
  ): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return truncateString(value, 256);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      if (context.depth >= 4 || value.length > 20) {
        return {
          type: 'array',
          length: value.length,
          sampled: value.slice(0, 3).map((entry, index) =>
            this.sanitizeValue(entry, {
              ...context,
              path: `${context.path}[${index}]`,
              depth: context.depth + 1,
            })
          ),
        };
      }

      return value.map((entry, index) =>
        this.sanitizeValue(entry, {
          ...context,
          path: `${context.path}[${index}]`,
          depth: context.depth + 1,
        })
      );
    }

    if (!isRecord(value)) {
      return {
        type: typeof value,
      };
    }

    if (context.depth >= 6) {
      return {
        type: 'object',
        fieldCount: Object.keys(value).length,
        truncated: true,
      };
    }

    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      const path = context.path ? `${context.path}.${key}` : key;
      if (!context.allowRawPayload && isSensitiveField(key)) {
        output[key] = '[REDACTED]';
        context.redactedFields.push(path);
        continue;
      }

      if (this.options.hashStudentIdentifiers && isIdentifierField(key) && typeof entry === 'string') {
        output[key] = this.hashIdentifier(entry);
        context.hashedFields.push(path);
        continue;
      }

      output[key] = this.sanitizeValue(entry, {
        ...context,
        path,
        depth: context.depth + 1,
      });
    }

    return output;
  }
}

export function classifyPayload(
  payload: unknown,
  privacyMode: ObserveModeConfig['privacyMode'] = 'strict'
): ObservePrivacyClassification {
  if (payload === undefined || payload === null) {
    return privacyMode === 'permissive' ? 'INTERNAL' : 'SENSITIVE';
  }

  if (typeof payload !== 'object') {
    return privacyMode === 'strict' ? 'SENSITIVE' : 'INTERNAL';
  }

  if (containsRestrictedField(payload)) {
    return 'RESTRICTED';
  }

  if (containsSensitiveField(payload)) {
    return 'SENSITIVE';
  }

  return privacyMode === 'strict' ? 'SENSITIVE' : 'INTERNAL';
}

function enforcePayloadLimit(
  value: unknown,
  maxPayloadBytes: number
): { value: unknown; truncated: boolean; omitted: boolean } {
  const size = estimatePayloadSize(value);
  if (size <= maxPayloadBytes) {
    return {
      value,
      truncated: false,
      omitted: false,
    };
  }

  return {
    value: {
      omitted: true,
      reason: 'Payload exceeded observe telemetry maxPayloadBytes.',
      estimatedSizeBytes: size,
      maxPayloadBytes,
    },
    truncated: true,
    omitted: true,
  };
}

function truncateString(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...[TRUNCATED]`;
}

function containsSensitiveField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsSensitiveField);
  }
  if (!isRecord(value)) {
    return false;
  }
  return Object.entries(value).some(([key, entry]) => isSensitiveField(key) || containsSensitiveField(entry));
}

function containsRestrictedField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsRestrictedField);
  }
  if (!isRecord(value)) {
    return false;
  }
  return Object.entries(value).some(([key, entry]) => /ssn|medical|diagnosis/i.test(key) || containsRestrictedField(entry));
}

function isSensitiveField(key: string): boolean {
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key));
}

function isIdentifierField(key: string): boolean {
  return IDENTIFIER_FIELD_PATTERNS.some((pattern) => pattern.test(key));
}

function estimatePayloadSize(payload: unknown): number {
  try {
    return JSON.stringify(payload)?.length ?? 0;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
