export const STAGING_SMOKE_HARNESS_PRIMARY_HOST = 'careeros-v2-inky.vercel.app';

export function isStagingSmokeHarnessHost(hostHeader: string | null | undefined, env: NodeJS.ProcessEnv = process.env): boolean {
  const host = normalizeHost(hostHeader);
  if (!host) return false;
  return stagingSmokeHarnessAllowedHosts(env).includes(host);
}

export function stagingSmokeHarnessAllowedHosts(env: NodeJS.ProcessEnv = process.env): readonly string[] {
  const hosts = new Set<string>([STAGING_SMOKE_HARNESS_PRIMARY_HOST]);
  const configuredHost = hostFromUrl(env.NEXT_PUBLIC_STAGING_URL);
  if (configuredHost) hosts.add(configuredHost);
  return Object.freeze([...hosts]);
}

function hostFromUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return normalizeHost(new URL(value).host);
  } catch {
    return undefined;
  }
}

function normalizeHost(value: string | null | undefined): string | undefined {
  const host = value?.split(',')[0]?.trim().toLowerCase();
  return host || undefined;
}
