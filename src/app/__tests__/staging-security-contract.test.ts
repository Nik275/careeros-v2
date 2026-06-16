import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ROUTE_SHADOW_INTERNAL_ACCESS_CLAIM_PATH,
  hasRouteShadowInternalAccessClaim,
} from '../../security/internal-access-claims';
import {
  INTERNAL_CONSTITUTIONAL_SHADOW_MIDDLEWARE_MATCHER,
  isInternalConstitutionalShadowRoutePath,
} from '../../security/internal-route-protection';
import {
  STAGING_AI_POSTURE,
  STAGING_ENVIRONMENT_CHECKLIST,
  SYNTHETIC_ONLY_STAGING_DATA_RULE,
  publicSecretChecklistViolations,
} from '../../security/staging-security-contract';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

describe('staging security contract', () => {
  it('requires the exact Clerk internal-access claim shape', () => {
    expect(ROUTE_SHADOW_INTERNAL_ACCESS_CLAIM_PATH).toBe('sessionClaims.metadata.internalAccess');
    expect(hasRouteShadowInternalAccessClaim({ metadata: { internalAccess: true } })).toBe(true);
    expect(hasRouteShadowInternalAccessClaim({ metadata: { internalAccess: false } })).toBe(false);
    expect(hasRouteShadowInternalAccessClaim({ internalAccess: true })).toBe(false);
    expect(hasRouteShadowInternalAccessClaim({ publicMetadata: { internalAccess: true } })).toBe(false);
    expect(hasRouteShadowInternalAccessClaim({ roles: ['careeros_internal'] })).toBe(false);
  });

  it('protects only internal constitutional-shadow routes through middleware matching', () => {
    expect(INTERNAL_CONSTITUTIONAL_SHADOW_MIDDLEWARE_MATCHER).toBe('/api/internal/constitutional-shadow/:path*');
    expect(isInternalConstitutionalShadowRoutePath('/api/internal/constitutional-shadow')).toBe(true);
    expect(isInternalConstitutionalShadowRoutePath('/api/internal/constitutional-shadow/assessment')).toBe(true);
    expect(isInternalConstitutionalShadowRoutePath('/api/public/health')).toBe(false);
    expect(isInternalConstitutionalShadowRoutePath('/')).toBe(false);

    const proxySource = readFileSync(join(process.cwd(), 'src', 'proxy.ts'), 'utf8');
    expect(proxySource).toContain('clerkMiddleware');
    expect(proxySource).toContain("matcher: ['/api/internal/constitutional-shadow/:path*']");
  });

  it('keeps staging secret variables server-only', () => {
    expect(publicSecretChecklistViolations()).toEqual([]);
    expect(STAGING_ENVIRONMENT_CHECKLIST.some((item) => item.name === 'CLERK_SECRET_KEY' && item.secret)).toBe(true);
    expect(STAGING_ENVIRONMENT_CHECKLIST.some((item) => item.name === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' && !item.secret)).toBe(
      true
    );
  });

  it('does not include active AI provider dependencies for staging', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as PackageJson;
    const installedDependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
    };

    expect(STAGING_AI_POSTURE.realProviderCallsEnabled).toBe(false);
    expect(STAGING_AI_POSTURE.approvedGatewayRequired).toBe(true);
    for (const dependencyName of STAGING_AI_POSTURE.prohibitedProviderDependencies) {
      expect(installedDependencies).not.toHaveProperty(dependencyName);
    }
  });

  it('requires synthetic-only staging data until the privacy lifecycle exists', () => {
    expect(SYNTHETIC_ONLY_STAGING_DATA_RULE).toContain('synthetic or internal test data only');
  });
});
