/**
 * @fileoverview Deployment provider discovery for Phase 6.5.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DeploymentProvider, DeploymentProviderDiscovery } from './DeploymentReadinessTypes';

export function discoverDeploymentProvider(rootDir = process.cwd()): DeploymentProviderDiscovery {
  const evidence: string[] = [];
  const blockers: string[] = [];
  const deploymentFiles: string[] = [];
  const packageJson = readJson(rootDir, 'package.json');
  const readme = readText(rootDir, 'README.md');

  for (const file of ['vercel.json', 'netlify.toml', 'railway.json', 'render.yaml', 'Dockerfile']) {
    if (existsSync(join(rootDir, file))) deploymentFiles.push(file);
  }

  const scripts = isRecord(packageJson.scripts) ? packageJson.scripts : {};
  const buildScripts = Object.entries(scripts).filter(([name]) => name.includes('build')).map(([name, value]) => `${name}: ${String(value)}`);
  const startScripts = Object.entries(scripts).filter(([name]) => name.includes('start') || name === 'dev').map(([name, value]) => `${name}: ${String(value)}`);

  let provider: DeploymentProvider = 'UNKNOWN';
  if (deploymentFiles.includes('vercel.json')) {
    provider = 'VERCEL';
    evidence.push('vercel.json exists.');
  } else if (deploymentFiles.includes('netlify.toml')) {
    provider = 'NETLIFY';
    evidence.push('netlify.toml exists.');
  } else if (deploymentFiles.includes('railway.json')) {
    provider = 'RAILWAY';
    evidence.push('railway.json exists.');
  } else if (deploymentFiles.includes('render.yaml')) {
    provider = 'RENDER';
    evidence.push('render.yaml exists.');
  } else if (deploymentFiles.includes('Dockerfile')) {
    provider = 'DOCKER';
    evidence.push('Dockerfile exists.');
  } else if (readme.includes('Deploy on Vercel') || readme.includes('Vercel Platform') || readme.includes('vercel.com')) {
    provider = 'VERCEL';
    evidence.push('README.md includes create-next-app Vercel deployment guidance.');
  } else if (hasDependency(packageJson, 'next') && String(scripts.start ?? '').includes('next start')) {
    provider = 'CUSTOM_NODE';
    evidence.push('package.json contains Next.js dependency and next start script.');
  }

  if (deploymentFiles.length === 0) blockers.push('No provider-specific deployment config file exists.');
  if (buildScripts.length === 0) blockers.push('No build script is available.');
  if (startScripts.length === 0) blockers.push('No start or dev script is available.');

  return Object.freeze({
    provider,
    evidence: Object.freeze(evidence),
    buildScripts: Object.freeze(buildScripts),
    startScripts: Object.freeze(startScripts),
    deploymentFiles: Object.freeze(deploymentFiles),
    blockers: Object.freeze(blockers),
  });
}

function readJson(rootDir: string, relativePath: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(join(rootDir, relativePath), 'utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function readText(rootDir: string, relativePath: string): string {
  try {
    return readFileSync(join(rootDir, relativePath), 'utf8');
  } catch {
    return '';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasDependency(packageJson: Record<string, unknown>, dependencyName: string): boolean {
  const dependencies = isRecord(packageJson.dependencies) ? packageJson.dependencies : {};
  const devDependencies = isRecord(packageJson.devDependencies) ? packageJson.devDependencies : {};
  return dependencyName in dependencies || dependencyName in devDependencies;
}
