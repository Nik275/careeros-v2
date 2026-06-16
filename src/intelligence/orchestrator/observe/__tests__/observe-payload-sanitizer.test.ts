import { describe, expect, it } from 'vitest';
import { ObservePayloadSanitizer } from '../ObservePayloadSanitizer';

describe('ObservePayloadSanitizer', () => {
  it('removes sensitive student fields', () => {
    const sanitizer = new ObservePayloadSanitizer();

    const summary = sanitizer.sanitize({
      studentId: 'student-123',
      email: 'student@example.com',
      responses: [{ value: 'private answer' }],
      safeCount: 3,
    });

    expect(summary.privacyClassification).toBe('SENSITIVE');
    expect(summary.redactedFields).toContain('email');
    expect(summary.redactedFields).toContain('responses');
    expect(summary.hashedFields).toContain('studentId');
    expect(JSON.stringify(summary.summary)).not.toContain('student@example.com');
    expect(JSON.stringify(summary.summary)).not.toContain('private answer');
  });

  it('defaults unknown payloads to SENSITIVE', () => {
    const sanitizer = new ObservePayloadSanitizer();

    const summary = sanitizer.sanitize('unknown payload');

    expect(summary.privacyClassification).toBe('SENSITIVE');
  });

  it('truncates large payloads through max payload bytes', () => {
    const sanitizer = new ObservePayloadSanitizer({
      maxPayloadBytes: 20,
    });

    const summary = sanitizer.sanitize({
      value: 'x'.repeat(200),
    });

    expect(summary.truncated).toBe(true);
    expect(summary.omitted).toBe(true);
    expect(summary.summary).toMatchObject({
      omitted: true,
      reason: 'Payload exceeded observe telemetry maxPayloadBytes.',
    });
  });

  it('hashes student identifiers when configured', () => {
    const sanitizer = new ObservePayloadSanitizer({
      hashStudentIdentifiers: true,
    });

    const summary = sanitizer.sanitize({
      studentId: 'student-123',
    });

    expect(summary.hashedFields).toContain('studentId');
    expect(JSON.stringify(summary.summary)).not.toContain('student-123');
    expect(JSON.stringify(summary.summary)).toContain('hash_');
  });

  it('does not store raw student responses by default', () => {
    const sanitizer = new ObservePayloadSanitizer({
      captureRawPayloads: false,
    });

    const summary = sanitizer.sanitize({
      studentResponses: ['raw answer'],
    });

    expect(summary.rawPayloadStored).toBe(false);
    expect(JSON.stringify(summary.summary)).not.toContain('raw answer');
  });
});
