/**
 * @fileoverview Source-backed app route discovery helpers for Phase 5.9.
 */

import {
  getAppEntrypointAlignments,
  getAppEntrypointCandidates,
} from './AppRehearsalEntrypointAdapter';
import type {
  AppEntrypointAlignment,
  AppEntrypointAlignmentDecision,
  AppEntrypointCandidate,
} from './AppRehearsalTypes';

export interface AppRouteGapAnalysis {
  flow: 'ASSESSMENT' | 'CAREER-FIT';
  rootCause:
    | 'app route uses different engine'
    | 'app route uses static/demo data'
    | 'app route bypasses engine'
    | 'app route has incomplete flow'
    | 'app route uses client-only logic'
    | 'app route uses API route not connected to engine'
    | 'app route missing entirely'
    | 'unknown';
  evidence: readonly string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedFix: string;
  requiresCodeChanges: boolean;
  canBeStagedSafely: boolean;
  affectsProductionOutput: boolean;
}

export interface AppEntrypointAlignmentStrategy {
  decision: AppEntrypointAlignmentDecision;
  reason: string;
  alignments: readonly AppEntrypointAlignment[];
  forbiddenActionsPreserved: readonly string[];
}

export function discoverAppEntrypoints(): readonly AppEntrypointCandidate[] {
  return getAppEntrypointCandidates();
}

export function analyzeAppRouteGaps(): readonly AppRouteGapAnalysis[] {
  return Object.freeze([
    Object.freeze({
      flow: 'ASSESSMENT',
      rootCause: 'app route uses client-only logic',
      evidence: Object.freeze([
        'src/app/assessment/page.tsx is marked use client.',
        'AssessmentPage stores AssessmentData in useState and transitions screens locally.',
        'No src/app or src/components code calls AssessmentEngine.processResponses.',
      ]),
      risk: 'MEDIUM',
      recommendedFix: 'Use a test-only app rehearsal adapter for Phase 5.9; defer production app-route wiring.',
      requiresCodeChanges: true,
      canBeStagedSafely: true,
      affectsProductionOutput: false,
    }),
    Object.freeze({
      flow: 'CAREER-FIT',
      rootCause: 'app route missing entirely',
      evidence: Object.freeze([
        'No src/app route or server action calls CareerFitEngine.calculateFit.',
        'src/components/assessment/ResultsDashboard.tsx renders static mockResults.',
        'CareerFitEngine.calculateFit exists only as a service boundary in src/career-fit/career-fit-engine.ts.',
      ]),
      risk: 'MEDIUM',
      recommendedFix: 'Use a test-only app rehearsal adapter backed by the validated service boundary.',
      requiresCodeChanges: true,
      canBeStagedSafely: true,
      affectsProductionOutput: false,
    }),
  ]);
}

export function selectAppEntrypointAlignmentStrategy(): AppEntrypointAlignmentStrategy {
  return Object.freeze({
    decision: 'IMPLEMENT_TEST_ONLY_REHEARSAL_ADAPTER',
    reason: 'Actual app routes cannot reach the validated hooks without UI behavior changes; a test-only adapter proves alignment while output remains unchanged.',
    alignments: getAppEntrypointAlignments(),
    forbiddenActionsPreserved: Object.freeze([
      'no production route output replacement',
      'no CANARY_LIVE',
      'no FULL_LIVE',
      'no app route modification',
      'no raw payload capture',
    ]),
  });
}
