/**
 * @fileoverview Local Next server process manager for Phase 6.2.
 */

import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import type { RouteShadowServerConfig, RouteShadowServerStatus } from './RouteShadowServerTypes';
import {
  isAllowedRouteShadowServerHost,
  isProductionRouteShadowServerHost,
} from './RouteShadowServerConfig';

export interface RouteShadowServerProcessStatus {
  status: RouteShadowServerStatus;
  started: boolean;
  ready: boolean;
  stopped: boolean;
  pid?: number;
  logs: string;
  reason?: string;
}

export class RouteShadowServerProcessManager {
  private child?: ChildProcess;
  private logs = '';

  async start(config: RouteShadowServerConfig): Promise<RouteShadowServerProcessStatus> {
    if (!config.enabled) return this.status('DISABLED', 'Server harness is disabled.');
    if (!config.startServer) return this.status('READY', 'Server start skipped; existing server expected.', false, true);
    if (config.environment === 'production' || config.environment === 'prod') return this.status('BLOCKED', 'Production environment is blocked.');
    if (config.environment === 'unknown') return this.status('BLOCKED', 'Unknown environment is blocked.');
    if (!isAllowedRouteShadowServerHost(config.baseUrl) || isProductionRouteShadowServerHost(config.baseUrl)) {
      return this.status('BLOCKED', 'Server baseUrl host is blocked.');
    }
    const command = config.serverStartCommand;
    if (!command || command.length === 0) return this.status('BLOCKED', 'Server start command is missing.');

    this.child = spawn(command[0], command.slice(1), {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    this.child.stdout?.on('data', (chunk) => {
      this.logs += chunk.toString();
    });
    this.child.stderr?.on('data', (chunk) => {
      this.logs += chunk.toString();
    });

    const ready = await this.waitForReadiness(config);
    if (!ready) {
      await this.stop();
      return this.status('FAILED', 'Server readiness timeout.', true, false);
    }
    return this.status('READY', 'Server is ready.', true, true);
  }

  async waitForReadiness(config: RouteShadowServerConfig): Promise<boolean> {
    const deadline = Date.now() + config.serverReadyTimeoutMs;
    while (Date.now() < deadline) {
      try {
        const response = await fetch(`${config.baseUrl}/api/internal/constitutional-shadow/assessment`, {
          method: 'GET',
          signal: AbortSignal.timeout(Math.min(2000, Math.max(250, config.requestTimeoutMs))),
        });
        if ([200, 404, 405].includes(response.status)) return true;
      } catch {
        // Retry until timeout.
      }
      await sleep(500);
    }
    return false;
  }

  getStatus(): RouteShadowServerProcessStatus {
    return this.status(this.child && !this.child.killed ? 'RUNNING' : 'CANCELLED');
  }

  async stop(): Promise<RouteShadowServerProcessStatus> {
    if (!this.child) return this.status('CANCELLED', 'No server process was started.', false, false, true);
    const child = this.child;
    if (child.pid && process.platform === 'win32') {
      spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    } else if (!child.killed) {
      child.kill('SIGTERM');
    }
    await sleep(500);
    if (!child.killed && process.platform !== 'win32') child.kill('SIGKILL');
    this.child = undefined;
    return this.status('CANCELLED', 'Server process stopped.', true, false, true);
  }

  private status(
    status: RouteShadowServerStatus,
    reason?: string,
    started = Boolean(this.child),
    ready = false,
    stopped = false
  ): RouteShadowServerProcessStatus {
    return Object.freeze({
      status,
      started,
      ready,
      stopped,
      pid: this.child?.pid,
      logs: this.logs.slice(-4000),
      reason,
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
