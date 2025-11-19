/**
 * Shared Domain Entity: HealthStatus
 * Represents the health status of an MCP server
 */

import { z } from 'zod';

export enum HealthState {
  OK = 'ok',
  DEGRADED = 'degraded',
  BROKEN = 'broken',
  UNKNOWN = 'unknown',
}

export const HealthCheckResultSchema = z.object({
  check: z.string().min(1),
  passed: z.boolean(),
  message: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export type HealthCheckResult = z.infer<typeof HealthCheckResultSchema>;

export const HealthStatusSchema = z.object({
  serverName: z.string().min(1),
  clientType: z.string().min(1),
  state: z.nativeEnum(HealthState),
  timestamp: z.date(),
  checks: z.array(HealthCheckResultSchema),
  overallMessage: z.string().optional(),
});

export type HealthStatusConfig = z.infer<typeof HealthStatusSchema>;

/**
 * HealthStatus Entity
 * Represents the result of a health check for an MCP server
 *
 * SOLID Principles:
 * - SRP: Only responsible for health status representation
 * - OCP: Can be extended but not modified
 */
export class HealthStatus {
  private readonly _serverName: string;
  private readonly _clientType: string;
  private readonly _state: HealthState;
  private readonly _timestamp: Date;
  private readonly _checks: HealthCheckResult[];
  private readonly _overallMessage?: string;

  constructor(config: HealthStatusConfig) {
    const validated = HealthStatusSchema.parse(config);

    this._serverName = validated.serverName;
    this._clientType = validated.clientType;
    this._state = validated.state;
    this._timestamp = validated.timestamp;
    this._checks = validated.checks;
    this._overallMessage = validated.overallMessage;
  }

  /**
   * Create a health status from individual checks
   */
  static fromChecks(
    serverName: string,
    clientType: string,
    checks: HealthCheckResult[],
    overallMessage?: string
  ): HealthStatus {
    // Determine overall state from checks
    let state: HealthState;
    if (checks.length === 0) {
      state = HealthState.UNKNOWN;
    } else if (checks.every(c => c.passed)) {
      state = HealthState.OK;
    } else if (checks.some(c => c.passed)) {
      state = HealthState.DEGRADED;
    } else {
      state = HealthState.BROKEN;
    }

    return new HealthStatus({
      serverName,
      clientType,
      state,
      timestamp: new Date(),
      checks,
      overallMessage,
    });
  }

  // Getters
  get serverName(): string {
    return this._serverName;
  }

  get clientType(): string {
    return this._clientType;
  }

  get state(): HealthState {
    return this._state;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  get checks(): ReadonlyArray<HealthCheckResult> {
    return this._checks;
  }

  get overallMessage(): string | undefined {
    return this._overallMessage;
  }

  /**
   * Check if server is healthy
   */
  isHealthy(): boolean {
    return this._state === HealthState.OK;
  }

  /**
   * Check if server is broken
   */
  isBroken(): boolean {
    return this._state === HealthState.BROKEN;
  }

  /**
   * Get failed checks
   */
  getFailedChecks(): HealthCheckResult[] {
    return this._checks.filter(c => !c.passed);
  }

  /**
   * Get passed checks
   */
  getPassedChecks(): HealthCheckResult[] {
    return this._checks.filter(c => c.passed);
  }

  /**
   * Get a summary message
   */
  getSummaryMessage(): string {
    if (this._overallMessage) {
      return this._overallMessage;
    }

    const passed = this.getPassedChecks().length;
    const total = this._checks.length;

    switch (this._state) {
      case HealthState.OK:
        return `All ${total} checks passed`;
      case HealthState.DEGRADED:
        return `${passed}/${total} checks passed`;
      case HealthState.BROKEN:
        return `All ${total} checks failed`;
      case HealthState.UNKNOWN:
        return 'Health status unknown';
      default:
        return 'Unknown health state';
    }
  }

  /**
   * Get display color for UI
   */
  getDisplayColor(): string {
    switch (this._state) {
      case HealthState.OK:
        return 'green';
      case HealthState.DEGRADED:
        return 'yellow';
      case HealthState.BROKEN:
        return 'red';
      case HealthState.UNKNOWN:
        return 'gray';
      default:
        return 'gray';
    }
  }

  /**
   * Get display icon for UI
   */
  getDisplayIcon(): string {
    switch (this._state) {
      case HealthState.OK:
        return '✓';
      case HealthState.DEGRADED:
        return '⚠';
      case HealthState.BROKEN:
        return '✗';
      case HealthState.UNKNOWN:
        return '?';
      default:
        return '?';
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): HealthStatusConfig {
    return {
      serverName: this._serverName,
      clientType: this._clientType,
      state: this._state,
      timestamp: this._timestamp,
      checks: this._checks,
      overallMessage: this._overallMessage,
    };
  }
}
