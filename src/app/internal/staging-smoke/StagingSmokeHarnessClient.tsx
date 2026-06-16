'use client';

import { useState } from 'react';

type SmokeCheckStatus = 'PASS' | 'FAIL';

interface SmokeCheckResult {
  readonly id: string;
  readonly label: string;
  readonly expected: string;
  readonly actualStatus: number | null;
  readonly status: SmokeCheckStatus;
  readonly rawPayloadEchoed: boolean;
  readonly summary: Readonly<Record<string, unknown>>;
}

interface SmokeHarnessResult {
  readonly generatedAt: string;
  readonly internalAccessClaimPath: string;
  readonly internalAccessClaimResolved: boolean;
  readonly syntheticOnly: boolean;
  readonly liveRoutingEnabled: boolean;
  readonly allowOutputReplacement: boolean;
  readonly captureRawPayloads: boolean;
  readonly realAiCallsEnabled: boolean;
  readonly rawPayloadEchoDetected: boolean;
  readonly overallStatus: SmokeCheckStatus;
  readonly checks: readonly SmokeCheckResult[];
}

type RunState =
  | { readonly status: 'idle' }
  | { readonly status: 'running' }
  | { readonly status: 'complete'; readonly result: SmokeHarnessResult }
  | { readonly status: 'error'; readonly message: string };

export function StagingSmokeHarnessClient() {
  const [state, setState] = useState<RunState>({ status: 'idle' });

  async function runChecks() {
    setState({ status: 'running' });
    try {
      const response = await fetch('/internal/staging-smoke/run', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
      const result = (await response.json()) as unknown;
      if (isSmokeHarnessResult(result)) {
        setState({ status: 'complete', result });
        return;
      }
      setState({ status: 'error', message: `Smoke harness request failed with HTTP ${response.status}.` });
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Smoke harness failed.' });
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 text-white">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Internal staging smoke</p>
        <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">Authenticated synthetic route checks</h1>
        <p className="max-w-3xl text-sm leading-6 text-white/68">
          This hidden harness runs only for Clerk-authenticated internal operators on the approved staging host. It submits
          synthetic payloads to protected internal shadow routes and reports redacted status summaries only.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <StatusItem label="Data" value="Synthetic only" />
          <StatusItem label="Live routing" value="Disabled" />
          <StatusItem label="Raw payload capture" value="Disabled" />
        </dl>
      </div>

      <div>
        <button
          type="button"
          onClick={() => void runChecks()}
          disabled={state.status === 'running'}
          className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:border-cyan-100/60 hover:bg-cyan-200/16 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === 'running' ? 'Running checks' : 'Run synthetic smoke checks'}
        </button>
      </div>

      {state.status === 'error' ? (
        <ResultPanel tone="fail" title="Harness failed">
          <p className="text-sm text-white/72">{state.message}</p>
        </ResultPanel>
      ) : null}

      {state.status === 'complete' ? <SmokeResults result={state.result} /> : null}
    </section>
  );
}

function SmokeResults({ result }: { readonly result: SmokeHarnessResult }) {
  return (
    <ResultPanel tone={result.overallStatus === 'PASS' ? 'pass' : 'fail'} title={`Overall: ${result.overallStatus}`}>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <StatusItem label="Claim path" value={result.internalAccessClaimPath} />
        <StatusItem label="Internal claim resolved" value={String(result.internalAccessClaimResolved)} />
        <StatusItem label="Synthetic only" value={String(result.syntheticOnly)} />
        <StatusItem label="Live routing" value={String(result.liveRoutingEnabled)} />
        <StatusItem label="Output replacement" value={String(result.allowOutputReplacement)} />
        <StatusItem label="Raw payload echo" value={String(result.rawPayloadEchoDetected)} />
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-white/10">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-white/[0.06] text-white/60">
            <tr>
              <th className="px-3 py-2 font-medium">Check</th>
              <th className="px-3 py-2 font-medium">HTTP</th>
              <th className="px-3 py-2 font-medium">Result</th>
              <th className="px-3 py-2 font-medium">Summary</th>
            </tr>
          </thead>
          <tbody>
            {result.checks.map((check) => (
              <tr key={check.id} className="border-t border-white/10">
                <td className="px-3 py-3 align-top text-white/82">
                  <div className="font-medium text-white">{check.label}</div>
                  <div className="mt-1 text-white/48">{check.expected}</div>
                </td>
                <td className="px-3 py-3 align-top text-white/72">{check.actualStatus ?? 'n/a'}</td>
                <td className={check.status === 'PASS' ? 'px-3 py-3 align-top text-emerald-200' : 'px-3 py-3 align-top text-rose-200'}>
                  {check.status}
                </td>
                <td className="px-3 py-3 align-top text-white/60">
                  <code className="break-words text-[11px] leading-5">{formatSummary(check.summary)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResultPanel>
  );
}

function StatusItem({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</dt>
      <dd className="mt-1 break-words text-white/84">{value}</dd>
    </div>
  );
}

function ResultPanel({
  tone,
  title,
  children,
}: {
  readonly tone: 'pass' | 'fail';
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  const toneClass = tone === 'pass' ? 'border-emerald-300/25 bg-emerald-300/[0.06]' : 'border-rose-300/25 bg-rose-300/[0.06]';
  return (
    <section className={`rounded-lg border p-5 ${toneClass}`}>
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function formatSummary(summary: Readonly<Record<string, unknown>>): string {
  const entries = Object.entries(summary).filter(([, value]) => value !== undefined);
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(', ');
}

function isSmokeHarnessResult(value: unknown): value is SmokeHarnessResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'overallStatus' in value &&
    'checks' in value &&
    Array.isArray((value as { readonly checks?: unknown }).checks)
  );
}
