/**
 * CLI Telemetry Helper
 * Utilities for tracking CLI command execution
 */

import { container } from 'tsyringe';
import { ITelemetryService } from '@/shared/infrastructure/telemetry/ITelemetryService';
import {
  TelemetryEventCategory,
  CliCommandEvent,
  ErrorCategory,
} from '@/shared/domain/events/TelemetryEvents';

/**
 * Track CLI command execution
 */
export async function trackCommand(
  commandName: string,
  flags: string[],
  success: boolean,
  durationMs: number
): Promise<void> {
  try {
    const telemetryService = container.resolve<ITelemetryService>('ITelemetryService');

    const event: CliCommandEvent = {
      command_name: commandName,
      flags_used: flags,
      success,
      duration_ms: durationMs,
    };

    await telemetryService.trackEvent(TelemetryEventCategory.CLI_COMMAND_EXECUTED, event);
  } catch (error) {
    // Never let telemetry errors break the CLI
    console.error('Telemetry error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Track CLI error
 */
export async function trackError(
  commandName: string,
  error: Error,
  errorCategory: ErrorCategory
): Promise<void> {
  try {
    const telemetryService = container.resolve<ITelemetryService>('ITelemetryService');

    await telemetryService.trackError(TelemetryEventCategory.ERROR_OCCURRED, {
      error_category: errorCategory,
      error_code: (error as NodeJS.ErrnoException).code,
      feature: `cli_${commandName}`,
    });
  } catch (telemetryError) {
    // Never let telemetry errors break the CLI
    console.error(
      'Telemetry error:',
      telemetryError instanceof Error ? telemetryError.message : 'Unknown error'
    );
  }
}

/**
 * Wrapper for command execution with telemetry tracking
 */
export async function withTelemetry<T>(
  commandName: string,
  flags: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  let success = false;

  try {
    const result = await fn();
    success = true;
    return result;
  } catch (error) {
    success = false;
    // Track error
    const errorCategory = categorizeError(error);
    await trackError(commandName, error as Error, errorCategory);
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    // Extract safe flags (no values)
    const safeFlags = Object.keys(flags).filter(key => flags[key] !== undefined);
    await trackCommand(commandName, safeFlags, success, duration);
  }
}

/**
 * Categorize error for telemetry
 */
function categorizeError(error: unknown): ErrorCategory {
  if (!(error instanceof Error)) {
    return ErrorCategory.UNKNOWN_ERROR;
  }

  const nodeError = error as NodeJS.ErrnoException;

  // Check error code
  if (nodeError.code) {
    switch (nodeError.code) {
      case 'EACCES':
      case 'EPERM':
        return ErrorCategory.PERMISSION_DENIED;
      case 'ENOENT':
      case 'ENOTDIR':
        return ErrorCategory.FILESYSTEM_ERROR;
      case 'ECONNREFUSED':
      case 'ENOTFOUND':
      case 'ETIMEDOUT':
        return ErrorCategory.NETWORK_ERROR;
      default:
        break;
    }
  }

  // Check error message patterns
  const message = error.message.toLowerCase();

  if (message.includes('permission') || message.includes('access denied')) {
    return ErrorCategory.PERMISSION_DENIED;
  }

  if (message.includes('network') || message.includes('connection')) {
    return ErrorCategory.NETWORK_ERROR;
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCategory.VALIDATION_ERROR;
  }

  if (message.includes('parse') || message.includes('json') || message.includes('yaml')) {
    return ErrorCategory.CONFIG_PARSE_ERROR;
  }

  if (message.includes('registry') || message.includes('api')) {
    return ErrorCategory.REGISTRY_API_ERROR;
  }

  return ErrorCategory.UNKNOWN_ERROR;
}

/**
 * Track app startup
 */
export async function trackAppStartup(startupDurationMs: number): Promise<void> {
  try {
    const telemetryService = container.resolve<ITelemetryService>('ITelemetryService');

    await telemetryService.trackEvent(TelemetryEventCategory.APP_STARTED, {
      startup_duration_ms: startupDurationMs,
    });
  } catch (error) {
    // Silent fail
  }
}

/**
 * Track app shutdown
 */
export async function trackAppShutdown(uptimeSeconds: number): Promise<void> {
  try {
    const telemetryService = container.resolve<ITelemetryService>('ITelemetryService');

    await telemetryService.trackEvent(TelemetryEventCategory.APP_CLOSED, {
      uptime_seconds: uptimeSeconds,
    });

    // Flush telemetry before exit
    await telemetryService.flush();
  } catch (error) {
    // Silent fail
  }
}
