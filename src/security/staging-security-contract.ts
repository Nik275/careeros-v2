export type StagingEnvExposure = 'server' | 'public';

export interface StagingEnvironmentVariableContract {
  readonly name: string;
  readonly exposure: StagingEnvExposure;
  readonly secret: boolean;
  readonly requiredForStaging: boolean;
  readonly purpose: string;
}

export const STAGING_ENVIRONMENT_CHECKLIST = [
  {
    name: 'NODE_ENV',
    exposure: 'server',
    secret: false,
    requiredForStaging: true,
    purpose: 'Runtime mode used to keep local/test bypasses out of staging and production-like environments.',
  },
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    exposure: 'public',
    secret: false,
    requiredForStaging: true,
    purpose: 'Public Clerk browser key. This must not contain server-side Clerk secrets.',
  },
  {
    name: 'CLERK_SECRET_KEY',
    exposure: 'server',
    secret: true,
    requiredForStaging: true,
    purpose: 'Server-only Clerk key used by middleware and server-side auth checks.',
  },
  {
    name: 'NEXT_PUBLIC_STAGING_URL',
    exposure: 'public',
    secret: false,
    requiredForStaging: true,
    purpose: 'Public staging origin used for smoke checks and same-origin validation expectations.',
  },
  {
    name: 'DATABASE_URL',
    exposure: 'server',
    secret: true,
    requiredForStaging: false,
    purpose: 'Server-only database URL, required only when DB-backed staging flows are explicitly enabled.',
  },
  {
    name: 'SVIX_SECRET',
    exposure: 'server',
    secret: true,
    requiredForStaging: false,
    purpose: 'Server-only webhook verification secret, required only when webhook ingestion is enabled.',
  },
] as const satisfies readonly StagingEnvironmentVariableContract[];

export const STAGING_AI_POSTURE = {
  realProviderCallsEnabled: false,
  approvedGatewayRequired: true,
  prohibitedProviderDependencies: ['openai', '@anthropic-ai/sdk', 'ai', 'langchain'] as const,
  providerEnvVarsMustRemainServerOnly: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'] as const,
} as const;

export const SYNTHETIC_ONLY_STAGING_DATA_RULE =
  'Staging must use synthetic or internal test data only until export, deletion, retention, consent, and breach-response workflows are implemented.';

export function publicSecretChecklistViolations(
  checklist: readonly StagingEnvironmentVariableContract[] = STAGING_ENVIRONMENT_CHECKLIST
): readonly string[] {
  return checklist.filter((item) => item.secret && item.name.startsWith('NEXT_PUBLIC_')).map((item) => item.name);
}
